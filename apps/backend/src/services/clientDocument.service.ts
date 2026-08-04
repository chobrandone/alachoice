import { supabaseAdmin } from '../lib/supabase.js';
import { NotFound, BadRequest } from '../utils/errors.js';
import type { DocumentAdminUpdate } from '@ala/types';

const BUCKET = 'documents';

function safeName(name: string) {
  const dot = name.lastIndexOf('.');
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  const ext = dot >= 0 ? name.slice(dot).toLowerCase() : '';
  return `${Date.now()}-${base || 'file'}${ext}`;
}

interface UploadInput {
  clientId: string;
  file: { originalname: string; mimetype: string; size: number; buffer: Buffer };
  docType?: string;
  applicationId?: string;
}

export async function uploadDocument({ clientId, file, docType, applicationId }: UploadInput) {
  if (!file) throw BadRequest('No file provided');
  // Namespace objects by client to keep the bucket tidy.
  const path = `clients/${clientId}/${safeName(file.originalname)}`;

  const { error: upErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
  if (upErr) throw BadRequest(`Upload failed: ${upErr.message}`);

  const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await supabaseAdmin
    .from('client_documents')
    .insert({
      client_id: clientId,
      application_id: applicationId ?? null,
      doc_type: docType ?? 'other',
      file_url: pub.publicUrl,
      file_name: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function listDocuments(clientId: string) {
  const { data, error } = await supabaseAdmin
    .from('client_documents')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function deleteDocument(clientId: string, id: string) {
  const { data: row, error } = await supabaseAdmin
    .from('client_documents')
    .select('*')
    .eq('id', id)
    .eq('client_id', clientId)
    .maybeSingle();
  if (error) throw error;
  if (!row) throw NotFound('Document not found');

  const path = decodeURIComponent(row.file_url.split(`/${BUCKET}/`).pop() ?? '');
  if (path) await supabaseAdmin.storage.from(BUCKET).remove([path]);

  const { error: delErr } = await supabaseAdmin
    .from('client_documents')
    .delete()
    .eq('id', id)
    .eq('client_id', clientId);
  if (delErr) throw delErr;
}

/* ---- Admin ---- */
export async function adminListDocuments(opts: { status?: string; page: number; pageSize: number }) {
  let q = supabaseAdmin
    .from('client_documents')
    .select('*, client:clients(full_name, email)', { count: 'exact' });
  if (opts.status) q = q.eq('status', opts.status);
  q = q.order('created_at', { ascending: false });
  const from = (opts.page - 1) * opts.pageSize;
  const { data, error, count } = await q.range(from, from + opts.pageSize - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function adminUpdateDocument(id: string, patch: DocumentAdminUpdate) {
  const { data, error } = await supabaseAdmin
    .from('client_documents')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Document not found');
  return data;
}
