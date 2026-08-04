import { Router } from 'express';
import { z } from 'zod';
import { applicationAdminUpdate, documentAdminUpdate, appointmentAdminUpdate } from '@ala/types';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { writeAudit } from '../services/audit.service.js';
import {
  adminListApplications,
  adminUpdateApplication,
} from '../services/application.service.js';
import { adminListDocuments, adminUpdateDocument } from '../services/clientDocument.service.js';
import { adminListAppointments, adminUpdateAppointment } from '../services/appointment.service.js';

const listQ = z.object({
  status: z.string().max(40).optional(),
  type: z.string().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
});

/* ---- Applications ---- */
export const applicationsAdminRouter = Router();
applicationsAdminRouter.use(requireAdmin);

applicationsAdminRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = listQ.parse(req.query);
    const { rows, total } = await adminListApplications(q);
    return ok(res, rows, { page: q.page, pageSize: q.pageSize, total });
  }),
);

applicationsAdminRouter.patch(
  '/:id',
  validate(applicationAdminUpdate),
  asyncHandler(async (req, res) => {
    const row = await adminUpdateApplication(req.params.id, req.body);
    await writeAudit(req, 'update', 'applications', req.params.id, req.body);
    return ok(res, row);
  }),
);

/* ---- Client documents ---- */
export const documentsAdminRouter = Router();
documentsAdminRouter.use(requireAdmin);

documentsAdminRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = listQ.parse(req.query);
    const { rows, total } = await adminListDocuments(q);
    return ok(res, rows, { page: q.page, pageSize: q.pageSize, total });
  }),
);

documentsAdminRouter.patch(
  '/:id',
  validate(documentAdminUpdate),
  asyncHandler(async (req, res) => {
    const row = await adminUpdateDocument(req.params.id, req.body);
    await writeAudit(req, 'update', 'client_documents', req.params.id, req.body);
    return ok(res, row);
  }),
);

/* ---- Appointments ---- */
export const appointmentsAdminRouter = Router();
appointmentsAdminRouter.use(requireAdmin);

appointmentsAdminRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = listQ.parse(req.query);
    const { rows, total } = await adminListAppointments(q);
    return ok(res, rows, { page: q.page, pageSize: q.pageSize, total });
  }),
);

appointmentsAdminRouter.patch(
  '/:id',
  validate(appointmentAdminUpdate),
  asyncHandler(async (req, res) => {
    const row = await adminUpdateAppointment(req.params.id, req.body);
    await writeAudit(req, 'update', 'appointments', req.params.id, req.body);
    return ok(res, row);
  }),
);

/* ---- Clients directory ---- */
export const clientsAdminRouter = Router();
clientsAdminRouter.use(requireAdmin);

clientsAdminRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 25);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    let q = supabaseAdmin.from('clients').select('*', { count: 'exact' });
    if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    q = q.order('created_at', { ascending: false });
    const from = (page - 1) * pageSize;
    const { data, error, count } = await q.range(from, from + pageSize - 1);
    if (error) throw error;
    return ok(res, data ?? [], { page, pageSize, total: count ?? 0 });
  }),
);
