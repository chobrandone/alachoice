import { Router } from 'express';
import { loginInput } from '@ala/types';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { login } from '../services/auth.service.js';

export const authRouter = Router();

authRouter.post(
  '/login',
  authLimiter,
  validate(loginInput),
  asyncHandler(async (req, res) => {
    const result = await login(req.body);
    return ok(res, result);
  }),
);

/** Returns the current admin identity for the presented token. */
authRouter.get(
  '/me',
  requireAdmin,
  asyncHandler(async (req, res) => ok(res, req.admin)),
);
