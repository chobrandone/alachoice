import { supabaseAdmin } from '../lib/supabase.js';
import { BadRequest, NotFound } from '../utils/errors.js';
import type { MediaBucket } from '@ala/types';

interface UploadInput {
  bucket: MediaBucket;
  file: { originalname: string; mimetype: string; size: number; buffer: Buffer };
  altText?: string;
  uploadedBy?: string | null;
}

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

export async function uploadMedia({ bucket, file, altText, uploadedBy }: UploadInput) {
  if (!file) throw BadRequest('No file provided');
  const path = safeName(file.originalname);

  const { error: upErr } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
  if (upErr) throw BadRequest(`Upload failed: ${upErr.message}`);

  const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

  const { data, error } = await supabaseAdmin
    .from('media')
    .insert({
      file_url: pub.publicUrl,
      file_name: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
      bucket,
      alt_text: altText ?? null,
      uploaded_by: uploadedBy ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function listMedia(bucket?: string, page = 1, pageSize = 40) {
  let q = supabaseAdmin.from('media').select('*', { count: 'exact' });
  if (bucket) q = q.eq('bucket', bucket);
  q = q.order('created_at', { ascending: false });
  const from = (page - 1) * pageSize;
  const { data, error, count } = await q.range(from, from + pageSize - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function deleteMedia(id: string) {
  const { data: row, error } = await supabaseAdmin
    .from('media')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!row) throw NotFound('Media not found');

  // Best-effort remove the storage object (path = last URL segment).
  const path = decodeURIComponent(row.file_url.split('/').pop() ?? '');
  if (path) await supabaseAdmin.storage.from(row.bucket).remove([path]);

  const { error: delErr } = await supabaseAdmin.from('media').delete().eq('id', id);
  if (delErr) throw delErr;
}
