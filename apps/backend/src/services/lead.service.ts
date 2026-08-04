import { supabaseAdmin } from '../lib/supabase.js';
import { NotFound } from '../utils/errors.js';
import type {
  LeadSource,
  LeadInput,
  LeadUpdate,
  LeadTaskInput,
  LeadTaskUpdate,
} from '@ala/types';

interface LeadSeed {
  name: string;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  subject?: string | null;
}

/**
 * Idempotently create a CRM lead from an inbound submission. Best-effort: a
 * failure here must never break the underlying submission, so callers wrap in
 * try/catch (or ignore the returned promise).
 */
export async function createLeadFromSubmission(
  source: LeadSource,
  sourceId: string | null,
  seed: LeadSeed,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('leads')
    .upsert(
      {
        source,
        source_id: sourceId,
        name: seed.name,
        email: seed.email ?? null,
        phone: seed.phone ?? null,
        country: seed.country ?? null,
        subject: seed.subject ?? null,
      },
      { onConflict: 'source,source_id', ignoreDuplicates: true },
    );
  if (error) throw error;
}

/** Active admins for the assignee dropdown (any admin may read this). */
export async function listAssignees() {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, full_name')
    .eq('is_active', true)
    .order('full_name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/* ---- Admin CRUD ---- */
export interface LeadFilters {
  status?: string;
  source?: string;
  assignedTo?: string;
  search?: string;
  page: number;
  pageSize: number;
}

export async function listLeads(f: LeadFilters) {
  let q = supabaseAdmin
    .from('leads')
    .select('*, assignee:admin_users(full_name)', { count: 'exact' });
  if (f.status) q = q.eq('status', f.status);
  if (f.source) q = q.eq('source', f.source);
  if (f.assignedTo) q = q.eq('assigned_to', f.assignedTo);
  if (f.search) {
    const s = f.search.replace(/[,()]/g, ' ').trim();
    q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,subject.ilike.%${s}%`);
  }
  q = q.order('created_at', { ascending: false });
  const from = (f.page - 1) * f.pageSize;
  const { data, error, count } = await q.range(from, from + f.pageSize - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function getLeadDetail(id: string) {
  const { data: leadRow, error } = await supabaseAdmin
    .from('leads')
    .select('*, assignee:admin_users(full_name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!leadRow) throw NotFound('Lead not found');

  const [{ data: notes }, { data: tasks }] = await Promise.all([
    supabaseAdmin
      .from('lead_notes')
      .select('*, author:admin_users(full_name)')
      .eq('lead_id', id)
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('lead_tasks').select('*').eq('lead_id', id).order('due_at', { ascending: true }),
  ]);

  return { ...leadRow, notes: notes ?? [], tasks: tasks ?? [] };
}

export async function createLead(input: LeadInput) {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .insert({ ...input, source: 'manual' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateLead(id: string, patch: LeadUpdate) {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .update(patch)
    .eq('id', id)
    .select('*, assignee:admin_users(full_name)')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Lead not found');
  return data;
}

export async function deleteLead(id: string) {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Lead not found');
}

/* ---- Notes ---- */
export async function addNote(leadId: string, adminUserId: string | null, body: string) {
  const { data, error } = await supabaseAdmin
    .from('lead_notes')
    .insert({ lead_id: leadId, admin_user_id: adminUserId, body })
    .select('*, author:admin_users(full_name)')
    .single();
  if (error) throw error;
  return data;
}

/* ---- Tasks ---- */
export async function addTask(leadId: string, adminUserId: string | null, input: LeadTaskInput) {
  const { data, error } = await supabaseAdmin
    .from('lead_tasks')
    .insert({ lead_id: leadId, admin_user_id: adminUserId, title: input.title, due_at: input.due_at ?? null })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, patch: LeadTaskUpdate) {
  const { data, error } = await supabaseAdmin
    .from('lead_tasks')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Task not found');
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabaseAdmin.from('lead_tasks').delete().eq('id', id);
  if (error) throw error;
}
