import type { NextFunction, Request, Response } from 'express';
import { supabaseAnon, supabaseAdmin } from '../lib/supabase.js';
import { Forbidden, Unauthorized } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { SessionUser } from '@ala/types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: SessionUser;
    }
  }
}

function bearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim() || null;
}

/**
 * Verifies the Supabase access token, then confirms the caller maps to an
 * active row in admin_users. Attaches req.admin.
 */
export const requireAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = bearer(req);
    if (!token) throw Unauthorized();

    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data.user) throw Unauthorized('Invalid or expired token');

    const { data: adminRow, error: adminErr } = await supabaseAdmin
      .from('admin_users')
      .select('id, auth_uid, full_name, email, role, is_active')
      .eq('auth_uid', data.user.id)
      .maybeSingle();

    if (adminErr) throw adminErr;
    if (!adminRow || !adminRow.is_active) throw Forbidden('Not an active admin account');

    req.admin = adminRow as SessionUser;
    next();
  },
);

/** Restricts a route to super_admin (used for the Users module). */
export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.admin?.role !== 'super_admin') throw Forbidden('Super admin only');
  next();
}
