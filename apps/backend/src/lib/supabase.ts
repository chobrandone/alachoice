import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Service-role client — SERVER-SIDE ONLY.
 * Bypasses RLS. Used for all admin writes and privileged reads.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Anon client — used only to verify a caller's JWT (getUser) and for
 * RLS-respecting reads if ever needed.
 */
export const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
