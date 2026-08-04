import { Router } from 'express';
import { inquiryInput, newsletterInput, quoteRequestInput } from '@ala/types';
import { validate } from '../middleware/validate.js';
import { publicWriteLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created } from '../utils/response.js';
import {
  createInquiry,
  createQuote,
  subscribeNewsletter,
} from '../services/submission.service.js';

/** Public, rate-limited lead-capture endpoints. */
export const submissionsRouter = Router();

submissionsRouter.post(
  '/inquiries',
  publicWriteLimiter,
  validate(inquiryInput),
  asyncHandler(async (req, res) => created(res, await createInquiry(req.body))),
);

submissionsRouter.post(
  '/newsletter',
  publicWriteLimiter,
  validate(newsletterInput),
  asyncHandler(async (req, res) => created(res, await subscribeNewsletter(req.body))),
);

submissionsRouter.post(
  '/quote-requests',
  publicWriteLimiter,
  validate(quoteRequestInput),
  asyncHandler(async (req, res) => created(res, await createQuote(req.body))),
);
