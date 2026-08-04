import { Router } from 'express';
import { z } from 'zod';
import {
  eventGalleryItemInput,
  reorderInput,
  eventFormFieldInput,
  eventFormFieldUpdate,
  eventRegistrationInput,
} from '@ala/types';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import { publicWriteLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, noContent } from '../utils/response.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { writeAudit } from '../services/audit.service.js';
import {
  listPublicEvents,
  getPublicEventBySlug,
  getNextFeaturedEvent,
  listAllGallery,
  addGalleryItem,
  deleteGalleryItem,
  reorderGallery,
} from '../services/event.service.js';
import {
  getPublicRegistrationForm,
  createRegistration,
  listFormFields,
  createFormField,
  updateFormField,
  deleteFormField,
  reorderFormFields,
} from '../services/registration.service.js';

const publicQuery = z.object({
  status: z.enum(['upcoming', 'past']).optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/* ---- Public ---- */
export const eventsPublicRouter = Router();

eventsPublicRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = publicQuery.parse(req.query);
    const { rows, total } = await listPublicEvents(q);
    return ok(res, rows, { page: q.page, pageSize: q.pageSize, total });
  }),
);

eventsPublicRouter.get(
  '/featured/next',
  asyncHandler(async (_req, res) => ok(res, await getNextFeaturedEvent())),
);

// All gallery photos across published events (defined before /:slug).
eventsPublicRouter.get(
  '/gallery/all',
  asyncHandler(async (_req, res) => ok(res, await listAllGallery())),
);

// Registration form definition (fields + seat/deadline status) for an event.
eventsPublicRouter.get(
  '/:slug/registration-form',
  asyncHandler(async (req, res) => ok(res, await getPublicRegistrationForm(req.params.slug))),
);

// Public registration submission (rate-limited + honeypot-guarded).
eventsPublicRouter.post(
  '/:slug/register',
  publicWriteLimiter,
  validate(eventRegistrationInput),
  asyncHandler(async (req, res) => created(res, await createRegistration(req.params.slug, req.body))),
);

eventsPublicRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => ok(res, await getPublicEventBySlug(req.params.slug))),
);

/* ---- Admin gallery sub-CRUD (base event CRUD comes from the generic admin router) ---- */
export const eventsAdminGalleryRouter = Router();
eventsAdminGalleryRouter.use(requireAdmin);

eventsAdminGalleryRouter.get(
  '/:eventId/gallery',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('event_gallery')
      .select('*')
      .eq('event_id', req.params.eventId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return ok(res, data ?? []);
  }),
);

eventsAdminGalleryRouter.post(
  '/:eventId/gallery',
  validate(eventGalleryItemInput),
  asyncHandler(async (req, res) => {
    const item = await addGalleryItem(req.params.eventId, req.body);
    await writeAudit(req, 'create', 'event_gallery', item.id, req.body);
    return created(res, item);
  }),
);

eventsAdminGalleryRouter.patch(
  '/gallery/reorder',
  validate(reorderInput),
  asyncHandler(async (req, res) => {
    await reorderGallery(req.body.items);
    return ok(res, { updated: req.body.items.length });
  }),
);

eventsAdminGalleryRouter.delete(
  '/gallery/:id',
  asyncHandler(async (req, res) => {
    await deleteGalleryItem(req.params.id);
    await writeAudit(req, 'delete', 'event_gallery', req.params.id);
    return noContent(res);
  }),
);

/* ---- Admin registration-form builder (fields per event) ---- */
eventsAdminGalleryRouter.get(
  '/:eventId/fields',
  asyncHandler(async (req, res) => ok(res, await listFormFields(req.params.eventId))),
);

eventsAdminGalleryRouter.post(
  '/:eventId/fields',
  validate(eventFormFieldInput),
  asyncHandler(async (req, res) => {
    const field = await createFormField(req.params.eventId, req.body);
    await writeAudit(req, 'create', 'event_form_fields', field.id, req.body);
    return created(res, field);
  }),
);

eventsAdminGalleryRouter.patch(
  '/fields/reorder',
  validate(reorderInput),
  asyncHandler(async (req, res) => {
    await reorderFormFields(req.body.items);
    return ok(res, { updated: req.body.items.length });
  }),
);

eventsAdminGalleryRouter.patch(
  '/fields/:id',
  validate(eventFormFieldUpdate),
  asyncHandler(async (req, res) => {
    const field = await updateFormField(req.params.id, req.body);
    await writeAudit(req, 'update', 'event_form_fields', req.params.id, req.body);
    return ok(res, field);
  }),
);

eventsAdminGalleryRouter.delete(
  '/fields/:id',
  asyncHandler(async (req, res) => {
    await deleteFormField(req.params.id);
    await writeAudit(req, 'delete', 'event_form_fields', req.params.id);
    return noContent(res);
  }),
);
