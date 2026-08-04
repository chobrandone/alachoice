import { Router } from 'express';
import multer from 'multer';
import { mediaBucket } from '@ala/types';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, noContent } from '../utils/response.js';
import { BadRequest } from '../utils/errors.js';
import { writeAudit } from '../services/audit.service.js';
import { uploadMedia, listMedia, deleteMedia } from '../services/media.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

export const mediaRouter = Router();
mediaRouter.use(requireAdmin);

mediaRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 40);
    const bucket = typeof req.query.bucket === 'string' ? req.query.bucket : undefined;
    const { rows, total } = await listMedia(bucket, page, pageSize);
    return ok(res, rows, { page, pageSize, total });
  }),
);

mediaRouter.post(
  '/upload',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const parsedBucket = mediaBucket.safeParse(req.body.bucket);
    if (!parsedBucket.success) throw BadRequest('Invalid or missing bucket');
    if (!req.file) throw BadRequest('No file provided');

    const row = await uploadMedia({
      bucket: parsedBucket.data,
      file: req.file,
      altText: typeof req.body.alt_text === 'string' ? req.body.alt_text : undefined,
      uploadedBy: req.admin?.id ?? null,
    });
    await writeAudit(req, 'create', 'media', row.id);
    return created(res, row);
  }),
);

mediaRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteMedia(req.params.id);
    await writeAudit(req, 'delete', 'media', req.params.id);
    return noContent(res);
  }),
);
