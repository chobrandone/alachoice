/** Application error with an HTTP status and a stable machine code. */
export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }
}

export const BadRequest = (msg = 'Bad request', details?: unknown) =>
  new AppError(400, 'BAD_REQUEST', msg, details);
export const Unauthorized = (msg = 'Authentication required') =>
  new AppError(401, 'UNAUTHORIZED', msg);
export const Forbidden = (msg = 'Insufficient permissions') =>
  new AppError(403, 'FORBIDDEN', msg);
export const NotFound = (msg = 'Resource not found') => new AppError(404, 'NOT_FOUND', msg);
export const Conflict = (msg = 'Conflict', details?: unknown) =>
  new AppError(409, 'CONFLICT', msg, details);
export const TooMany = (msg = 'Too many requests') =>
  new AppError(429, 'RATE_LIMITED', msg);
export const Internal = (msg = 'Internal server error', details?: unknown) =>
  new AppError(500, 'INTERNAL', msg, details);
