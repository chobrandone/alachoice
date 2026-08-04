import type { Response } from 'express';

export interface Meta {
  page?: number;
  pageSize?: number;
  total?: number;
}

export function ok<T>(res: Response, data: T, meta?: Meta, status = 200) {
  return res.status(status).json({ success: true, data, error: null, meta });
}

export function created<T>(res: Response, data: T) {
  return res.status(201).json({ success: true, data, error: null });
}

export function noContent(res: Response) {
  return res.status(204).send();
}

export function fail(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return res
    .status(status)
    .json({ success: false, data: null, error: { code, message, details } });
}
