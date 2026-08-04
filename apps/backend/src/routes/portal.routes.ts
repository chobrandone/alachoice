import { Router } from 'express';
import multer from 'multer';
import {
  clientRegisterInput,
  clientLoginInput,
  clientProfileUpdate,
  applicationCreateInput,
  applicationUpdateInput,
  applicationSignInput,
  appointmentBookInput,
} from '@ala/types';
import { validate } from '../middleware/validate.js';
import { publicWriteLimiter, authLimiter } from '../middleware/rateLimit.js';
import { requireClient } from '../middleware/portalAuth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, noContent } from '../utils/response.js';
import { BadRequest } from '../utils/errors.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { registerClient, loginClient } from '../services/portalAuth.service.js';
import {
  listApplications,
  getApplication,
  createApplication,
  updateApplication,
  signApplication,
  deleteApplication,
} from '../services/application.service.js';
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
} from '../services/clientDocument.service.js';
import {
  listOpenSlots,
  listAppointments,
  bookAppointment,
  cancelAppointment,
} from '../services/appointment.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

export const portalRouter = Router();

/* ---- Auth ---- */
portalRouter.post(
  '/auth/register',
  authLimiter,
  validate(clientRegisterInput),
  asyncHandler(async (req, res) => created(res, await registerClient(req.body))),
);

portalRouter.post(
  '/auth/login',
  authLimiter,
  validate(clientLoginInput),
  asyncHandler(async (req, res) => ok(res, await loginClient(req.body))),
);

portalRouter.get(
  '/auth/me',
  requireClient,
  asyncHandler(async (req, res) => ok(res, req.client)),
);

/* ---- Profile ---- */
portalRouter.patch(
  '/profile',
  requireClient,
  validate(clientProfileUpdate),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(req.body)
      .eq('id', req.client!.id)
      .select('id, auth_uid, full_name, email, phone, country')
      .single();
    if (error) throw error;
    return ok(res, data);
  }),
);

/* ---- Applications (client-scoped) ---- */
portalRouter.get(
  '/applications',
  requireClient,
  asyncHandler(async (req, res) => ok(res, await listApplications(req.client!.id))),
);

portalRouter.post(
  '/applications',
  requireClient,
  validate(applicationCreateInput),
  asyncHandler(async (req, res) => created(res, await createApplication(req.client!.id, req.body))),
);

portalRouter.get(
  '/applications/:id',
  requireClient,
  asyncHandler(async (req, res) => ok(res, await getApplication(req.client!.id, req.params.id))),
);

portalRouter.patch(
  '/applications/:id',
  requireClient,
  validate(applicationUpdateInput),
  asyncHandler(async (req, res) =>
    ok(res, await updateApplication(req.client!.id, req.params.id, req.body)),
  ),
);

portalRouter.post(
  '/applications/:id/sign',
  requireClient,
  validate(applicationSignInput),
  asyncHandler(async (req, res) =>
    ok(res, await signApplication(req.client!.id, req.params.id, {
      signature: req.body.signature,
      signedName: req.body.signed_name,
    })),
  ),
);

portalRouter.delete(
  '/applications/:id',
  requireClient,
  asyncHandler(async (req, res) => {
    await deleteApplication(req.client!.id, req.params.id);
    return noContent(res);
  }),
);

/* ---- Documents (client-scoped) ---- */
portalRouter.get(
  '/documents',
  requireClient,
  asyncHandler(async (req, res) => ok(res, await listDocuments(req.client!.id))),
);

portalRouter.post(
  '/documents',
  requireClient,
  publicWriteLimiter,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw BadRequest('No file provided');
    const row = await uploadDocument({
      clientId: req.client!.id,
      file: req.file,
      docType: typeof req.body.doc_type === 'string' ? req.body.doc_type : undefined,
      applicationId: typeof req.body.application_id === 'string' ? req.body.application_id : undefined,
    });
    return created(res, row);
  }),
);

portalRouter.delete(
  '/documents/:id',
  requireClient,
  asyncHandler(async (req, res) => {
    await deleteDocument(req.client!.id, req.params.id);
    return noContent(res);
  }),
);

/* ---- Appointments (client-scoped) ---- */
portalRouter.get(
  '/slots',
  requireClient,
  asyncHandler(async (_req, res) => ok(res, await listOpenSlots())),
);

portalRouter.get(
  '/appointments',
  requireClient,
  asyncHandler(async (req, res) => ok(res, await listAppointments(req.client!.id))),
);

portalRouter.post(
  '/appointments',
  requireClient,
  validate(appointmentBookInput),
  asyncHandler(async (req, res) =>
    created(res, await bookAppointment(req.client!.id, req.client!.email, req.body)),
  ),
);

portalRouter.patch(
  '/appointments/:id/cancel',
  requireClient,
  asyncHandler(async (req, res) => ok(res, await cancelAppointment(req.client!.id, req.params.id))),
);
