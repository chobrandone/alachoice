import { Router } from 'express';
import { z } from 'zod';
import { submissionStatus } from '@ala/types';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, noContent } from '../utils/response.js';
import { NotFound } from '../utils/errors.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { writeAudit } from '../services/audit.service.js';

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

async function paginated(table: string, page: number, pageSize: number, status?: string) {
  let q = supabaseAdmin.from(table).select('*', { count: 'exact' });
  if (status) q = q.eq('status', status);
  q = q.order('created_at', { ascending: false });
  const from = (page - 1) * pageSize;
  const { data, error, count } = await q.range(from, from + pageSize - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

/** Builds a standard read/status/delete/export router for a submissions table. */
function submissionsRouterFor(table: string, hasStatus: boolean) {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 20);
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const { rows, total } = await paginated(table, page, pageSize, status);
      return ok(res, rows, { page, pageSize, total });
    }),
  );

  router.get(
    '/export',
    asyncHandler(async (_req, res) => {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${table}.csv"`);
      return res.send(toCsv(data ?? []));
    }),
  );

  if (hasStatus) {
    router.patch(
      '/:id',
      validate(z.object({ status: submissionStatus })),
      asyncHandler(async (req, res) => {
        const { data, error } = await supabaseAdmin
          .from(table)
          .update({ status: req.body.status })
          .eq('id', req.params.id)
          .select('*')
          .maybeSingle();
        if (error) throw error;
        if (!data) throw NotFound();
        await writeAudit(req, 'update', table, req.params.id, req.body);
        return ok(res, data);
      }),
    );
  } else {
    // newsletter: toggle is_active
    router.patch(
      '/:id',
      validate(z.object({ is_active: z.boolean() })),
      asyncHandler(async (req, res) => {
        const { data, error } = await supabaseAdmin
          .from(table)
          .update({ is_active: req.body.is_active })
          .eq('id', req.params.id)
          .select('*')
          .maybeSingle();
        if (error) throw error;
        if (!data) throw NotFound();
        await writeAudit(req, 'update', table, req.params.id, req.body);
        return ok(res, data);
      }),
    );
  }

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const { data, error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('id', req.params.id)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw NotFound();
      await writeAudit(req, 'delete', table, req.params.id);
      return noContent(res);
    }),
  );

  return router;
}

export const inquiriesAdminRouter = Router();
inquiriesAdminRouter.use(requireAdmin);
inquiriesAdminRouter.use(submissionsRouterFor('inquiries', true));

export const quotesAdminRouter = Router();
quotesAdminRouter.use(requireAdmin);
quotesAdminRouter.use(submissionsRouterFor('quote_requests', true));

export const newsletterAdminRouter = Router();
newsletterAdminRouter.use(requireAdmin);
newsletterAdminRouter.use(submissionsRouterFor('newsletter_subscribers', false));

/* ---- Audit log (read-only) ---- */
export const auditAdminRouter = Router();
auditAdminRouter.use(requireAdmin);
auditAdminRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 30);
    const entity = typeof req.query.entity === 'string' ? req.query.entity : undefined;
    let q = supabaseAdmin.from('audit_logs').select('*', { count: 'exact' });
    if (entity) q = q.eq('entity', entity);
    q = q.order('created_at', { ascending: false });
    const from = (page - 1) * pageSize;
    const { data, error, count } = await q.range(from, from + pageSize - 1);
    if (error) throw error;
    return ok(res, data ?? [], { page, pageSize, total: count ?? 0 });
  }),
);
