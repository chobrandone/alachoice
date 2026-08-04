import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import type { EventFormField } from '@ala/types';

interface RegistrationRow {
  registration_ref: string;
  status: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  data: Record<string, unknown>;
  created_at: string;
}

export interface ExportResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

/** Fixed leading columns present on every export, in order. */
const CORE_COLUMNS: { key: keyof RegistrationRow | 'created_at'; header: string }[] = [
  { key: 'registration_ref', header: 'Ref' },
  { key: 'status', header: 'Status' },
  { key: 'full_name', header: 'Full Name' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'country', header: 'Country' },
  { key: 'created_at', header: 'Registered At' },
];

function cell(row: RegistrationRow, key: string): string {
  if (key === 'created_at') return new Date(row.created_at).toISOString().replace('T', ' ').slice(0, 19);
  const v = (row as unknown as Record<string, unknown>)[key];
  if (v == null) return '';
  return String(v);
}

function customCell(row: RegistrationRow, field: EventFormField): string {
  const v = row.data?.[field.field_key];
  if (v == null) return '';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}

function safeSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'export';
}

function buildHeaders(fields: EventFormField[]): string[] {
  return [...CORE_COLUMNS.map((c) => c.header), ...fields.map((f) => f.label_en)];
}

function buildRow(row: RegistrationRow, fields: EventFormField[]): string[] {
  return [
    ...CORE_COLUMNS.map((c) => cell(row, c.key as string)),
    ...fields.map((f) => customCell(row, f)),
  ];
}

/* ------------------------------------------------------------------ Excel */
export async function toXlsx(
  rows: RegistrationRow[],
  fields: EventFormField[],
  eventTitle: string,
): Promise<ExportResult> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ALA Website';
  wb.created = new Date();
  const ws = wb.addWorksheet('Attendees', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const headers = buildHeaders(fields);
  ws.columns = headers.map((h) => ({
    header: h,
    width: Math.min(Math.max(h.length + 4, 14), 40),
  }));

  // Header styling
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A2540' } };
  headerRow.alignment = { vertical: 'middle' };
  headerRow.height = 20;

  for (const row of rows) ws.addRow(buildRow(row, fields));

  // Auto filter across the full used range
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    filename: `attendees-${safeSlug(eventTitle)}.xlsx`,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}

/* -------------------------------------------------------------------- CSV */
function csvEscape(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function toCsv(
  rows: RegistrationRow[],
  fields: EventFormField[],
  eventTitle: string,
): ExportResult {
  const lines: string[] = [];
  lines.push(buildHeaders(fields).map(csvEscape).join(','));
  for (const row of rows) lines.push(buildRow(row, fields).map(csvEscape).join(','));
  // Prepend BOM so Excel opens UTF-8 correctly.
  const buffer = Buffer.from('﻿' + lines.join('\r\n'), 'utf8');
  return {
    buffer,
    filename: `attendees-${safeSlug(eventTitle)}.csv`,
    contentType: 'text/csv; charset=utf-8',
  };
}

/* -------------------------------------------------------------------- PDF */
export function toPdf(
  rows: RegistrationRow[],
  fields: EventFormField[],
  eventTitle: string,
): Promise<ExportResult> {
  return new Promise((resolve, reject) => {
    // Landscape so wide attendee tables fit.
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 36 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('error', reject);
    doc.on('end', () =>
      resolve({
        buffer: Buffer.concat(chunks),
        filename: `attendees-${safeSlug(eventTitle)}.pdf`,
        contentType: 'application/pdf',
      }),
    );

    doc.fontSize(16).fillColor('#0A2540').text(`Attendees — ${eventTitle}`, { continued: false });
    doc
      .fontSize(9)
      .fillColor('#666')
      .text(`Generated ${new Date().toLocaleString()} · ${rows.length} registrations`);
    doc.moveDown(0.8);

    // Keep the PDF readable: core columns + up to 3 custom fields.
    const shownFields = fields.slice(0, 3);
    const headers = ['Ref', 'Name', 'Email', 'Phone', 'Country', 'Status', ...shownFields.map((f) => f.label_en)];
    const colCount = headers.length;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = pageWidth / colCount;
    const left = doc.page.margins.left;

    const drawRow = (cells: string[], opts: { bold?: boolean; fill?: boolean } = {}) => {
      const y = doc.y;
      const rowHeight = 18;
      if (opts.fill) {
        doc.rect(left, y, pageWidth, rowHeight).fill('#0A2540');
      }
      doc.fillColor(opts.fill ? '#FFFFFF' : '#111').fontSize(8);
      if (opts.bold) doc.font('Helvetica-Bold');
      else doc.font('Helvetica');
      cells.forEach((c, i) => {
        doc.text(c, left + i * colWidth + 3, y + 5, {
          width: colWidth - 6,
          height: rowHeight,
          ellipsis: true,
          lineBreak: false,
        });
      });
      doc.y = y + rowHeight;
    };

    drawRow(headers, { bold: true, fill: true });

    rows.forEach((r) => {
      if (doc.y + 18 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        drawRow(headers, { bold: true, fill: true });
      }
      drawRow([
        r.registration_ref,
        r.full_name,
        r.email,
        r.phone ?? '',
        r.country ?? '',
        r.status,
        ...shownFields.map((f) => customCell(r, f)),
      ]);
    });

    doc.end();
  });
}

export async function buildExport(
  format: 'xlsx' | 'csv' | 'pdf',
  rows: RegistrationRow[],
  fields: EventFormField[],
  eventTitle: string,
): Promise<ExportResult> {
  switch (format) {
    case 'xlsx':
      return toXlsx(rows, fields, eventTitle);
    case 'csv':
      return toCsv(rows, fields, eventTitle);
    case 'pdf':
      return toPdf(rows, fields, eventTitle);
  }
}
