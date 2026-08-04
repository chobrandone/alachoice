import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
import { fail } from '../utils/response.js';
import { isProd } from '../config/env.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return fail(res, 400, 'VALIDATION_ERROR', 'Validation failed', err.flatten());
  }

  if (err instanceof AppError) {
    return fail(res, err.status, err.code, err.message, err.details);
  }

  // Unknown / unexpected
  if (!isProd) console.error(err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  return fail(res, 500, 'INTERNAL', isProd ? 'Internal server error' : message);
}

export function notFoundHandler(_req: Request, res: Response) {
  return fail(res, 404, 'NOT_FOUND', 'Route not found');
}
