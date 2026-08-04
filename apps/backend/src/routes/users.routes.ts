import { Router } from 'express';
import { adminUserInput, adminUserUpdate } from '@ala/types';
import { requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, noContent } from '../utils/response.js';
import { writeAudit } from '../services/audit.service.js';
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../services/user.service.js';

/** Users module — super_admin only. */
export const usersRouter = Router();
usersRouter.use(requireAdmin, requireSuperAdmin);

usersRouter.get('/', asyncHandler(async (_req, res) => ok(res, await listAdminUsers())));

usersRouter.post(
  '/',
  validate(adminUserInput),
  asyncHandler(async (req, res) => {
    const row = await createAdminUser(req.body);
    await writeAudit(req, 'create', 'admin_users', row.id);
    return created(res, row);
  }),
);

usersRouter.patch(
  '/:id',
  validate(adminUserUpdate),
  asyncHandler(async (req, res) => {
    const row = await updateAdminUser(req.params.id, req.body);
    await writeAudit(req, 'update', 'admin_users', row.id, req.body);
    return ok(res, row);
  }),
);

usersRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteAdminUser(req.params.id);
    await writeAudit(req, 'delete', 'admin_users', req.params.id);
    return noContent(res);
  }),
);
