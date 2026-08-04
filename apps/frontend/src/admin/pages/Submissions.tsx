import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Download, Mail } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/format';
import { useAdminList, useRemove } from '../lib/crud';
import { DataTable } from '../components/DataTable';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import type { ColumnConfig } from '../lib/fields';

const STATUS = ['new', 'read', 'replied', 'archived'] as const;

async function downloadCsv(path: string, filename: string) {
  const { data } = await api.get<Blob>(`${path}/export`, { auth: true, raw: true });
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type Row = { id: string } & Record<string, unknown>;

function SubmissionsTable({
  path,
  title,
  kind,
}: {
  path: string;
  title: string;
  kind: 'inquiry' | 'quote' | 'newsletter';
}) {
  const qc = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const list = useAdminList<Row>(path, { page, pageSize: 20 });
  const remove = useRemove(path);

  const patch = async (id: string, body: Record<string, unknown>) => {
    try {
      await api.patch(`${path}/${id}`, body, { auth: true });
      qc.invalidateQueries({ queryKey: [path] });
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Update failed');
    }
  };

  const statusCol: ColumnConfig<Row> = {
    key: 'status',
    label: 'Status',
    render: (r) => (
      <select
        value={String(r.status)}
        onChange={(e) => patch(r.id, { status: e.target.value })}
        className="rounded-input border border-ala-grey-200 bg-white px-2 py-1 text-xs focus:border-ala-navy focus:outline-none"
      >
        {STATUS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    ),
  };

  const activeCol: ColumnConfig<Row> = {
    key: 'is_active',
    label: 'Active',
    render: (r) => (
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          className="h-4 w-4 accent-ala-navy"
          checked={!!r.is_active}
          onChange={(e) => patch(r.id, { is_active: e.target.checked })}
        />
      </label>
    ),
  };

  const dateCol: ColumnConfig<Row> = {
    key: 'created_at',
    label: 'Received',
    render: (r) => <span className="text-ala-grey-500">{formatDate(String(r.created_at))}</span>,
  };

  const mailCol: ColumnConfig<Row> = {
    key: 'email',
    label: 'Email',
    render: (r) => (
      <a href={`mailto:${r.email}`} className="flex items-center gap-1 text-ala-navy hover:underline">
        <Mail className="h-3.5 w-3.5" /> {String(r.email)}
      </a>
    ),
  };

  const columns: ColumnConfig<Row>[] =
    kind === 'newsletter'
      ? [mailCol, activeCol, dateCol]
      : kind === 'quote'
        ? [
            { key: 'name', label: 'Name' },
            mailCol,
            { key: 'budget_range', label: 'Budget' },
            statusCol,
            dateCol,
          ]
        : [
            { key: 'name', label: 'Name' },
            mailCol,
            {
              key: 'message',
              label: 'Message',
              render: (r) => (
                <span className="line-clamp-2 max-w-xs text-ala-grey-500">{String(r.message)}</span>
              ),
            },
            statusCol,
            dateCol,
          ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ala-navy">{title}</h1>
        <Button size="sm" variant="outline-navy" onClick={() => downloadCsv(path, `${kind}.csv`)}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <DataTable<Row>
        columns={columns}
        rows={list.data?.data ?? []}
        loading={list.isLoading}
        meta={list.data?.meta}
        onPage={setPage}
        onDelete={(r) => setDeleting(r)}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        message="This will permanently delete this record."
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast('success', 'Deleted');
              setDeleting(null);
            },
            onError: (e) => toast('error', e instanceof ApiError ? e.message : 'Delete failed'),
          })
        }
        busy={remove.isPending}
      />
    </div>
  );
}

export const Inquiries = () => (
  <SubmissionsTable path="/admin/inquiries" title="Inquiries" kind="inquiry" />
);
export const Quotes = () => (
  <SubmissionsTable path="/admin/quote-requests" title="Quote Requests" kind="quote" />
);
export const Newsletter = () => (
  <SubmissionsTable path="/admin/newsletter" title="Newsletter Subscribers" kind="newsletter" />
);
