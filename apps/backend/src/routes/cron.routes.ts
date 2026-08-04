import { Router } from 'express';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { Unauthorized } from '../utils/errors.js';
import { runReminders } from '../services/reminder.service.js';

/**
 * Cron endpoints for serverless hosts (Vercel Cron) where the in-process
 * setInterval scheduler can't run. Guarded by CRON_SECRET when set — Vercel
 * automatically sends `Authorization: Bearer <CRON_SECRET>` to cron requests.
 */
export const cronRouter = Router();

cronRouter.get(
  '/reminders',
  asyncHandler(async (req, res) => {
    if (env.CRON_SECRET && req.headers.authorization !== `Bearer ${env.CRON_SECRET}`) {
      throw Unauthorized();
    }
    return ok(res, await runReminders());
  }),
);
