import { Router } from 'express';
import { z } from 'zod';
import { leadInput, leadUpdate, leadNoteInput, leadTaskInput, leadTaskUpdate } from '@ala/types';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, noContent } from '../utils/response.js';
import { writeAudit } from '../services/audit.service.js';
import {
  listLeads,
  listAssignees,
  getLeadDetail,
  createLead,
  updateLead,
  deleteLead,
  addNote,
  addTask,
  updateTask,
  deleteTask,
} from '../services/lead.service.js';

const listQ = z.object({
  status: z.string().max(40).optional(),
  source: z.string().max(40).optional(),
  assignedTo: z.string().uuid().optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
});

export const leadsAdminRouter = Router();
leadsAdminRouter.use(requireAdmin);

leadsAdminRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = listQ.parse(req.query);
    const { rows, total } = await listLeads(q);
    return ok(res, rows, { page: q.page, pageSize: q.pageSize, total });
  }),
);

leadsAdminRouter.post(
  '/',
  validate(leadInput),
  asyncHandler(async (req, res) => {
    const row = await createLead(req.body);
    await writeAudit(req, 'create', 'leads', row.id, req.body);
    return created(res, row);
  }),
);

// Specific path before the /:id matcher.
leadsAdminRouter.get(
  '/assignees',
  asyncHandler(async (_req, res) => ok(res, await listAssignees())),
);

leadsAdminRouter.get(
  '/:id',
  asyncHandler(async (req, res) => ok(res, await getLeadDetail(req.params.id))),
);

leadsAdminRouter.patch(
  '/:id',
  validate(leadUpdate),
  asyncHandler(async (req, res) => {
    const row = await updateLead(req.params.id, req.body);
    await writeAudit(req, 'update', 'leads', req.params.id, req.body);
    return ok(res, row);
  }),
);

leadsAdminRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteLead(req.params.id);
    await writeAudit(req, 'delete', 'leads', req.params.id);
    return noContent(res);
  }),
);

/* ---- Notes ---- */
leadsAdminRouter.post(
  '/:id/notes',
  validate(leadNoteInput),
  asyncHandler(async (req, res) =>
    created(res, await addNote(req.params.id, req.admin?.id ?? null, req.body.body)),
  ),
);

/* ---- Tasks ---- */
leadsAdminRouter.post(
  '/:id/tasks',
  validate(leadTaskInput),
  asyncHandler(async (req, res) =>
    created(res, await addTask(req.params.id, req.admin?.id ?? null, req.body)),
  ),
);

// Task update/delete keyed by task id (mounted under the same router).
export const leadTasksAdminRouter = Router();
leadTasksAdminRouter.use(requireAdmin);

leadTasksAdminRouter.patch(
  '/:id',
  validate(leadTaskUpdate),
  asyncHandler(async (req, res) => ok(res, await updateTask(req.params.id, req.body))),
);

leadTasksAdminRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteTask(req.params.id);
    return noContent(res);
  }),
);
