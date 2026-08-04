import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny, infer as zInfer } from 'zod';

type Target = 'body' | 'query' | 'params';

/**
 * Validates and REPLACES req[target] with the parsed value (with defaults /
 * coercion applied). Throws ZodError → handled centrally as 400.
 */
export function validate(schema: ZodTypeAny, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[target]);
    // query/params are read-only getters on some Express versions; assign safely
    if (target === 'body') req.body = parsed;
    else Object.defineProperty(req, target, { value: parsed, writable: true });
    next();
  };
}

export type Infer<T extends ZodTypeAny> = zInfer<T>;
