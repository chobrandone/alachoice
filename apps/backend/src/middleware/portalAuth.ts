import type { NextFunction, Request, Response } from 'express';
import { supabaseAnon, supabaseAdmin } from '../lib/supabase.js';
import { Unauthorized } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { SessionClient } from '@ala/types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      client?: SessionClient;
    }
  }
}

function bearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim() || null;
}

/**
 * Verifies the Supabase access token, then confirms the caller maps to a row in
 * `clients` (a portal user, NOT an admin). Attaches req.client.
 */
export const requireClient = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = bearer(req);
    if (!token) throw Unauthorized();

    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data.user) throw Unauthorized('Invalid or expired token');

    const { data: row, error: cErr } = await supabaseAdmin
      .from('clients')
      .select('id, auth_uid, full_name, email, phone, country')
      .eq('auth_uid', data.user.id)
      .maybeSingle();

    if (cErr) throw cErr;
    if (!row) throw Unauthorized('Not a client account');

    req.client = row as SessionClient;
    next();
  },
);
