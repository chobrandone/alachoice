import { supabaseAnon, supabaseAdmin } from '../lib/supabase.js';
import { Forbidden, Unauthorized } from '../utils/errors.js';
import type { LoginInput, SessionUser } from '@ala/types';

export interface LoginResult {
  token: string;
  refreshToken: string;
  expiresAt: number | undefined;
  user: SessionUser;
}

export async function login({ email, password }: LoginInput): Promise<LoginResult> {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) throw Unauthorized('Invalid credentials');

  const { data: adminRow, error: adminErr } = await supabaseAdmin
    .from('admin_users')
    .select('id, auth_uid, full_name, email, role, is_active')
    .eq('auth_uid', data.user.id)
    .maybeSingle();

  if (adminErr) throw adminErr;
  if (!adminRow || !adminRow.is_active) throw Forbidden('Not an active admin account');

  return {
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    user: adminRow as SessionUser,
  };
}
