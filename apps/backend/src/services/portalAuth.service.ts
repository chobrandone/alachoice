import { supabaseAnon, supabaseAdmin } from '../lib/supabase.js';
import { BadRequest, Unauthorized } from '../utils/errors.js';
import { sendMail } from '../lib/mailer.js';
import type { ClientRegisterInput, ClientLoginInput, SessionClient } from '@ala/types';

export interface PortalSession {
  token: string;
  refreshToken: string;
  expiresAt: number | undefined;
  client: SessionClient;
}

async function signIn(email: string, password: string): Promise<PortalSession> {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) throw Unauthorized('Invalid credentials');

  const { data: row, error: cErr } = await supabaseAdmin
    .from('clients')
    .select('id, auth_uid, full_name, email, phone, country')
    .eq('auth_uid', data.user.id)
    .maybeSingle();
  if (cErr) throw cErr;
  if (!row) throw Unauthorized('Not a client account');

  return {
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    client: row as SessionClient,
  };
}

export async function registerClient(input: ClientRegisterInput): Promise<PortalSession> {
  // Create the Supabase auth user (email auto-confirmed so they can log in now).
  const { data: authRes, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (authErr || !authRes.user) {
    if (/already registered|already exists|duplicate/i.test(authErr?.message ?? ''))
      throw BadRequest('An account with this email already exists');
    throw BadRequest(authErr?.message ?? 'Could not create account');
  }

  const { error: cErr } = await supabaseAdmin.from('clients').insert({
    auth_uid: authRes.user.id,
    full_name: input.full_name,
    email: input.email,
    phone: input.phone ?? null,
    country: input.country ?? null,
  });
  if (cErr) {
    // Roll back the orphaned auth user so a retry works.
    await supabaseAdmin.auth.admin.deleteUser(authRes.user.id).catch(() => {});
    if ((cErr as { code?: string }).code === '23505')
      throw BadRequest('An account with this email already exists');
    throw cErr;
  }

  await sendMail({
    to: input.email,
    subject: 'Welcome to the ALA Client Portal',
    text:
      `Hello ${input.full_name},\n\n` +
      `Your ALA Client Portal account is ready. You can now sign in to start applications, ` +
      `upload documents, and track your progress.\n\n— American Liaison in Africa`,
  });

  return signIn(input.email, input.password);
}

export async function loginClient(input: ClientLoginInput): Promise<PortalSession> {
  return signIn(input.email, input.password);
}
