import { supabaseAdmin } from '../lib/supabase.js';
import { BadRequest, NotFound } from '../utils/errors.js';
import type { AdminUserInput } from '@ala/types';

export async function listAdminUsers() {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, auth_uid, full_name, email, role, is_active, created_at, updated_at')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Creates a Supabase auth user, then the admin_users row. Rolls back auth on failure. */
export async function createAdminUser(input: AdminUserInput) {
  const { data: authRes, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (authErr || !authRes.user) throw BadRequest(authErr?.message ?? 'Could not create auth user');

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .insert({
      auth_uid: authRes.user.id,
      full_name: input.full_name,
      email: input.email,
      role: input.role,
      is_active: input.is_active,
    })
    .select('id, auth_uid, full_name, email, role, is_active, created_at, updated_at')
    .single();

  if (error) {
    // Roll back the orphaned auth user so a retry with the same email works.
    await supabaseAdmin.auth.admin.deleteUser(authRes.user.id).catch(() => {});
    throw error;
  }
  return data;
}

export async function updateAdminUser(
  id: string,
  patch: { full_name?: string; role?: 'super_admin' | 'editor'; is_active?: boolean },
) {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .update(patch)
    .eq('id', id)
    .select('id, auth_uid, full_name, email, role, is_active, created_at, updated_at')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Admin user not found');
  return data;
}

export async function deleteAdminUser(id: string) {
  const { data: row, error } = await supabaseAdmin
    .from('admin_users')
    .select('auth_uid')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!row) throw NotFound('Admin user not found');

  await supabaseAdmin.from('admin_users').delete().eq('id', id);
  if (row.auth_uid) await supabaseAdmin.auth.admin.deleteUser(row.auth_uid).catch(() => {});
}
