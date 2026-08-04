import { Router } from 'express';
import { z } from 'zod';
import { eventRegistrationUpdate, registrationStatus } from '@ala/types';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, noContent } from '../utils/response.js';
import { BadRequest } from '../utils/errors.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { writeAudit } from '../services/audit.service.js';
import {
  listRegistrations,
  fetchAllRegistrations,
  getRegistrationsByIds,
  updateRegistration,
  deleteRegistration,
  listFormFields,
  type RegistrationFilters,
} from '../services/registration.service.js';
import { buildExport } from '../services/export.service.js';
import type { EventFormField } from '@ala/types';

export const registrationsAdminRouter = Router();
registrationsAdminRouter.use(requireAdmin);

const listQuerySchema = z.object({
  eventId: z.string().uuid().optional(),
  status: registrationStatus.optional(),
  country: z.string().trim().max(120).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
});

/* ---- List (search + filters + pagination) ---- */
registrationsAdminRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = listQuerySchema.parse(req.query);
    const { rows, total } = await listRegistrations(q as RegistrationFilters);
    return ok(res, rows, { page: q.page, pageSize: q.pageSize, total });
  }),
);

/* ---- Export (xlsx / csv / pdf) — filters OR explicit ids ---- */
const exportSchema = z.object({
  format: z.enum(['xlsx', 'csv', 'pdf']),
  eventId: z.string().uuid().optional(),
  status: registrationStatus.optional(),
  country: z.string().trim().max(120).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  search: z.string().trim().max(200).optional(),
  ids: z.array(z.string().uuid()).max(10000).optional(),
});

registrationsAdminRouter.post(
  '/export',
  validate(exportSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof exportSchema>;

    // Rows: either the explicit selection or everything matching the filters.
    const rows = body.ids?.length
      ? await getRegistrationsByIds(body.ids)
      : await fetchAllRegistrations({
          eventId: body.eventId,
          status: body.status,
          country: body.country,
          from: body.from,
          to: body.to,
          search: body.search,
        });

    // Columns match a single event's form fields. Mixed-event exports get core
    // columns only (each event has a different field set).
    let fields: EventFormField[] = [];
    let eventTitle = 'all-events';
    if (body.eventId) {
      fields = await listFormFields(body.eventId);
      const { data: ev } = await supabaseAdmin
        .from('events')
        .select('title_en')
        .eq('id', body.eventId)
        .maybeSingle();
      if (ev?.title_en) eventTitle = ev.title_en;
    }

    const { buffer, filename, contentType } = await buildExport(
      body.format,
      rows as never,
      fields,
      eventTitle,
    );
    await writeAudit(req, 'export', 'event_registrations');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  }),
);

/* ---- Read one ---- */
registrationsAdminRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows = await getRegistrationsByIds([req.params.id]);
    if (!rows.length) throw BadRequest('Registration not found');
    return ok(res, rows[0]);
  }),
);

/* ---- Update status / notes ---- */
registrationsAdminRouter.patch(
  '/:id',
  validate(eventRegistrationUpdate),
  asyncHandler(async (req, res) => {
    const row = await updateRegistration(req.params.id, req.body);
    await writeAudit(req, 'update', 'event_registrations', req.params.id, req.body);
    return ok(res, row);
  }),
);

/* ---- Delete ---- */
registrationsAdminRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteRegistration(req.params.id);
    await writeAudit(req, 'delete', 'event_registrations', req.params.id);
    return noContent(res);
  }),
);
