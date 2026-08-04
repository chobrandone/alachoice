import { supabaseAdmin } from '../lib/supabase.js';
import { sendMail } from '../lib/mailer.js';
import { createLeadFromSubmission } from './lead.service.js';
import { NotFound, BadRequest } from '../utils/errors.js';
import type {
  ApplicationCreateInput,
  ApplicationUpdateInput,
  ApplicationAdminUpdate,
} from '@ala/types';

function makeRef(): string {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return `APP-${s}`;
}

/* ---- Client-scoped ---- */
export async function listApplications(clientId: string) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getApplication(clientId: string, id: string) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('*')
    .eq('id', id)
    .eq('client_id', clientId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Application not found');
  return data;
}

export async function createApplication(clientId: string, input: ApplicationCreateInput) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert({
        client_id: clientId,
        ref: makeRef(),
        type: input.type,
        title: input.title,
        data: input.data ?? {},
        progress: input.progress ?? 0,
        status: 'draft',
      })
      .select('*')
      .single();
    if (!error) return data;
    if ((error as { code?: string }).code !== '23505') throw error;
  }
  throw BadRequest('Could not create application, please retry');
}

export async function updateApplication(
  clientId: string,
  id: string,
  input: ApplicationUpdateInput,
) {
  const existing = await getApplication(clientId, id);
  // Once past draft/submitted, the client can no longer edit.
  if (!['draft', 'submitted'].includes(existing.status))
    throw BadRequest('This application is under review and can no longer be edited');

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.data !== undefined) patch.data = input.data;
  if (input.progress !== undefined) patch.progress = input.progress;
  if (input.status === 'submitted' && existing.status === 'draft') {
    patch.status = 'submitted';
    patch.submitted_at = new Date().toISOString();
    patch.progress = 100;
  }
  if (input.status === 'draft') patch.status = 'draft';

  const { data, error } = await supabaseAdmin
    .from('applications')
    .update(patch)
    .eq('id', id)
    .eq('client_id', clientId)
    .select('*')
    .single();
  if (error) throw error;

  if (patch.status === 'submitted') {
    // CRM lead from the submitting client (best-effort).
    supabaseAdmin
      .from('clients')
      .select('full_name, email, phone, country')
      .eq('id', clientId)
      .maybeSingle()
      .then(({ data: c }) => {
        if (!c) return;
        return createLeadFromSubmission('application', data.id as string, {
          name: c.full_name,
          email: c.email,
          phone: c.phone,
          country: c.country,
          subject: `Application: ${data.title} (${data.ref})`,
        });
      })
      .then(undefined, (e) => console.error('[lead] failed to create from application', e));

    await sendMail({
      subject: `New application submitted: ${data.title} (${data.ref})`,
      text: `A client submitted application ${data.ref} (${data.type}).`,
    });
  }
  return data;
}

export async function signApplication(
  clientId: string,
  id: string,
  input: { signature: string; signedName: string },
) {
  const existing = await getApplication(clientId, id);
  if (!['draft', 'submitted'].includes(existing.status))
    throw BadRequest('This application can no longer be signed');

  // Decode the PNG data URL and store it.
  const m = /^data:image\/png;base64,(.+)$/.exec(input.signature);
  if (!m) throw BadRequest('Invalid signature image');
  const buffer = Buffer.from(m[1], 'base64');
  const path = `clients/${clientId}/signatures/${id}-${Date.now()}.png`;
  const { error: upErr } = await supabaseAdmin.storage
    .from('documents')
    .upload(path, buffer, { contentType: 'image/png', upsert: true });
  if (upErr) throw BadRequest(`Signature upload failed: ${upErr.message}`);
  const { data: pub } = supabaseAdmin.storage.from('documents').getPublicUrl(path);

  const { data, error } = await supabaseAdmin
    .from('applications')
    .update({
      signature_url: pub.publicUrl,
      signed_at: new Date().toISOString(),
      signed_name: input.signedName,
      status: 'submitted',
      submitted_at: existing.submitted_at ?? new Date().toISOString(),
      progress: 100,
    })
    .eq('id', id)
    .eq('client_id', clientId)
    .select('*')
    .single();
  if (error) throw error;

  // CRM lead + notify (best-effort), mirroring updateApplication's submit path.
  supabaseAdmin
    .from('clients')
    .select('full_name, email, phone, country')
    .eq('id', clientId)
    .maybeSingle()
    .then(({ data: c }) => {
      if (!c) return;
      return createLeadFromSubmission('application', data.id as string, {
        name: c.full_name,
        email: c.email,
        phone: c.phone,
        country: c.country,
        subject: `Application: ${data.title} (${data.ref})`,
      });
    })
    .then(undefined, (e) => console.error('[lead] failed to create from signed application', e));

  await sendMail({
    subject: `Application signed & submitted: ${data.title} (${data.ref})`,
    text: `${input.signedName} signed and submitted application ${data.ref}.`,
  });
  return data;
}

export async function deleteApplication(clientId: string, id: string) {
  const existing = await getApplication(clientId, id);
  if (existing.status !== 'draft') throw BadRequest('Only draft applications can be deleted');
  const { error } = await supabaseAdmin
    .from('applications')
    .delete()
    .eq('id', id)
    .eq('client_id', clientId);
  if (error) throw error;
}

/* ---- Admin ---- */
export async function adminListApplications(opts: {
  status?: string;
  type?: string;
  page: number;
  pageSize: number;
}) {
  let q = supabaseAdmin
    .from('applications')
    .select('*, client:clients(full_name, email, country)', { count: 'exact' });
  if (opts.status) q = q.eq('status', opts.status);
  if (opts.type) q = q.eq('type', opts.type);
  q = q.order('created_at', { ascending: false });
  const from = (opts.page - 1) * opts.pageSize;
  const { data, error, count } = await q.range(from, from + opts.pageSize - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function adminUpdateApplication(id: string, patch: ApplicationAdminUpdate) {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .update(patch)
    .eq('id', id)
    .select('*, client:clients(full_name, email)')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Application not found');

  // Notify the client of a status change.
  const clientEmail = (data as { client?: { email?: string } }).client?.email;
  if (patch.status && clientEmail) {
    await sendMail({
      to: clientEmail,
      subject: `Update on your ALA application ${data.ref}`,
      text: `The status of your application "${data.title}" is now: ${patch.status}.`,
    });
  }
  return data;
}
