import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/** Applied to public write endpoints (inquiries, newsletter, quotes). */
export const publicWriteLimiter = rateLimit({
  windowMs: env.PUBLIC_RATE_WINDOW_MS,
  max: env.PUBLIC_RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' },
  },
});

/** Slightly stricter limiter for the login endpoint. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: { code: 'RATE_LIMITED', message: 'Too many login attempts.' },
  },
});
