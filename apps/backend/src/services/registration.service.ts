import { supabaseAdmin } from '../lib/supabase.js';
import { sendMail } from '../lib/mailer.js';
import { env } from '../config/env.js';
import { createLeadFromSubmission } from './lead.service.js';
import { BadRequest, NotFound } from '../utils/errors.js';
import type {
  EventFormField,
  EventFormFieldInput,
  EventFormFieldUpdate,
  EventRegistrationInput,
  RegistrationStatus,
} from '@ala/types';

/** Statuses that occupy a seat against the event capacity. */
const SEAT_STATUSES: RegistrationStatus[] = ['pending', 'confirmed', 'attended'];

/** Honeypot guard (mirrors submission.service). */
function assertHuman(company?: string) {
  if (company && company.trim().length > 0) throw BadRequest('Spam detected');
}

/** Human-friendly, collision-resistant registration reference, e.g. ALA-7F3K9Q. */
function makeRef(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `ALA-${s}`;
}

async function countSeatsTaken(eventId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('event_registrations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .in('status', SEAT_STATUSES);
  if (error) throw error;
  return count ?? 0;
}

/* ============================================================================
 * FORM FIELDS (admin CRUD + public read)
 * ==========================================================================*/
export async function listFormFields(eventId: string): Promise<EventFormField[]> {
  const { data, error } = await supabaseAdmin
    .from('event_form_fields')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as EventFormField[];
}

export async function createFormField(eventId: string, input: EventFormFieldInput) {
  const { data, error } = await supabaseAdmin
    .from('event_form_fields')
    .insert({ ...input, event_id: eventId })
    .select('*')
    .single();
  if (error) {
    if ((error as { code?: string }).code === '23505')
      throw BadRequest(`A field with key "${input.field_key}" already exists on this event`);
    throw error;
  }
  return data;
}

export async function updateFormField(id: string, input: EventFormFieldUpdate) {
  const { data, error } = await supabaseAdmin
    .from('event_form_fields')
    .update(input)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Form field not found');
  return data;
}

export async function deleteFormField(id: string) {
  const { data, error } = await supabaseAdmin
    .from('event_form_fields')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Form field not found');
}

export async function reorderFormFields(items: { id: string; sort_order: number }[]) {
  for (const it of items) {
    const { error } = await supabaseAdmin
      .from('event_form_fields')
      .update({ sort_order: it.sort_order })
      .eq('id', it.id);
    if (error) throw error;
  }
}

/* ============================================================================
 * PUBLIC — registration form + submission
 * ==========================================================================*/
export async function getPublicRegistrationForm(slug: string) {
  const { data: ev, error } = await supabaseAdmin
    .from('events')
    .select(
      'id, slug, title_en, title_fr, registration_enabled, registration_deadline, capacity, is_published',
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  if (!ev) throw NotFound('Event not found');

  const fields = await listFormFields(ev.id);
  const seatsTaken = await countSeatsTaken(ev.id);
  const capacity = ev.capacity ?? null;
  const seatsRemaining = capacity == null ? null : Math.max(0, capacity - seatsTaken);
  const isFull = capacity != null && seatsTaken >= capacity;
  const deadlinePassed = ev.registration_deadline
    ? new Date(ev.registration_deadline).getTime() < Date.now()
    : false;
  const isClosed = !ev.registration_enabled || deadlinePassed;

  return {
    event: {
      id: ev.id,
      slug: ev.slug,
      title_en: ev.title_en,
      title_fr: ev.title_fr,
      registration_enabled: ev.registration_enabled,
      registration_deadline: ev.registration_deadline,
      capacity,
      seats_taken: seatsTaken,
      seats_remaining: seatsRemaining,
      is_full: isFull,
      is_closed: isClosed,
    },
    fields,
  };
}

/** Coerce/validate a single custom answer against its field definition. */
function normalizeAnswer(field: EventFormField, raw: unknown): unknown {
  if (raw == null || raw === '') return null;
  switch (field.field_type) {
    case 'checkbox': {
      // multi-select → array of option values
      const arr = Array.isArray(raw) ? raw : [raw];
      return arr.map((v) => String(v));
    }
    case 'number': {
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }
    default:
      return String(raw);
  }
}

export async function createRegistration(slug: string, input: EventRegistrationInput) {
  assertHuman(input.company);

  const { data: ev, error: evErr } = await supabaseAdmin
    .from('events')
    .select(
      'id, title_en, registration_enabled, registration_deadline, capacity, is_published',
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (evErr) throw evErr;
  if (!ev) throw NotFound('Event not found');

  if (!ev.registration_enabled) throw BadRequest('Registration is closed for this event');
  if (ev.registration_deadline && new Date(ev.registration_deadline).getTime() < Date.now())
    throw BadRequest('The registration deadline for this event has passed');

  const fields = await listFormFields(ev.id);

  // Validate required custom fields and normalize answers.
  const answers: Record<string, unknown> = {};
  for (const f of fields) {
    const val = normalizeAnswer(f, (input.data ?? {})[f.field_key]);
    const empty = val == null || (Array.isArray(val) && val.length === 0);
    if (f.is_required && empty) throw BadRequest(`"${f.label_en}" is required`);
    if (!empty) answers[f.field_key] = val;
  }

  // Seat check → waitlist when full instead of rejecting.
  const capacity = ev.capacity ?? null;
  let status: RegistrationStatus = 'pending';
  if (capacity != null) {
    const taken = await countSeatsTaken(ev.id);
    if (taken >= capacity) status = 'waitlisted';
  }

  // Insert with a unique ref (retry once on the astronomically-unlikely clash).
  let row: Record<string, unknown> | null = null;
  for (let attempt = 0; attempt < 3 && !row; attempt++) {
    const { data, error } = await supabaseAdmin
      .from('event_registrations')
      .insert({
        event_id: ev.id,
        registration_ref: makeRef(),
        status,
        full_name: input.full_name,
        email: input.email,
        phone: input.phone ?? null,
        country: input.country ?? null,
        data: answers,
      })
      .select('*')
      .single();
    if (!error) {
      row = data;
      break;
    }
    if ((error as { code?: string }).code !== '23505') throw error; // not a ref clash
  }
  if (!row) throw BadRequest('Could not generate a unique registration reference, please retry');

  const ref = row.registration_ref as string;
  const waitlisted = status === 'waitlisted';

  // CRM lead (best-effort; never breaks the registration).
  createLeadFromSubmission('event_registration', row.id as string, {
    name: input.full_name,
    email: input.email,
    phone: input.phone ?? null,
    country: input.country ?? null,
    subject: `Registered: ${ev.title_en} (${ref})`,
  }).catch((e) => console.error('[lead] failed to create from registration', e));

  // Confirmation to the attendee (best-effort).
  await sendMail({
    to: input.email,
    subject: `${waitlisted ? 'Waitlist' : 'Registration'} confirmation — ${ev.title_en} (${ref})`,
    text:
      `Hello ${input.full_name},\n\n` +
      (waitlisted
        ? `This event is currently at capacity, so you have been added to the WAITLIST for "${ev.title_en}".\n`
        : `Your registration for "${ev.title_en}" has been received.\n`) +
      `\nYour registration reference is: ${ref}\n\n` +
      `We will contact you with further details. Please keep this reference for your records.\n\n` +
      `— American Liaison in Africa`,
  });

  // Notify the ALA team.
  await sendMail({
    subject: `New event registration: ${ev.title_en} — ${input.full_name} (${ref})`,
    replyTo: input.email,
    text:
      `Event: ${ev.title_en}\nRef: ${ref}\nStatus: ${status}\n` +
      `Name: ${input.full_name}\nEmail: ${input.email}\nPhone: ${input.phone ?? '—'}\n` +
      `Country: ${input.country ?? '—'}\n\n` +
      fields
        .map((f) => `${f.label_en}: ${formatAnswer((answers as Record<string, unknown>)[f.field_key])}`)
        .join('\n'),
  });

  return { registration_ref: ref, status };
}

function formatAnswer(v: unknown): string {
  if (v == null) return '—';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}

/* ============================================================================
 * ADMIN — attendee management
 * ==========================================================================*/
export interface RegistrationFilters {
  eventId?: string;
  status?: RegistrationStatus;
  country?: string;
  from?: string; // ISO date (inclusive)
  to?: string; // ISO date (inclusive)
  search?: string;
  page: number;
  pageSize: number;
}

function applyFilters<T>(q: T, f: RegistrationFilters): T {
  // supabase query builder is chainable; typed loosely to keep this reusable.
  let query = q as unknown as {
    eq: (c: string, v: unknown) => typeof query;
    ilike: (c: string, v: string) => typeof query;
    or: (v: string) => typeof query;
    gte: (c: string, v: string) => typeof query;
    lte: (c: string, v: string) => typeof query;
  };
  if (f.eventId) query = query.eq('event_id', f.eventId);
  if (f.status) query = query.eq('status', f.status);
  if (f.country) query = query.ilike('country', f.country);
  if (f.from) query = query.gte('created_at', f.from);
  if (f.to) query = query.lte('created_at', f.to);
  if (f.search) {
    const s = f.search.replace(/[,()]/g, ' ').trim();
    query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,registration_ref.ilike.%${s}%`);
  }
  return query as unknown as T;
}

export async function listRegistrations(f: RegistrationFilters) {
  let q = supabaseAdmin.from('event_registrations').select('*', { count: 'exact' });
  q = applyFilters(q, f);
  q = q.order('created_at', { ascending: false });
  const from = (f.page - 1) * f.pageSize;
  const { data, error, count } = await q.range(from, from + f.pageSize - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

/** Fetch every row matching the filters (no pagination) — used by exports. */
export async function fetchAllRegistrations(f: Omit<RegistrationFilters, 'page' | 'pageSize'>) {
  let q = supabaseAdmin.from('event_registrations').select('*');
  q = applyFilters(q, { ...f, page: 1, pageSize: 0 });
  q = q.order('created_at', { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getRegistrationsByIds(ids: string[]) {
  const { data, error } = await supabaseAdmin
    .from('event_registrations')
    .select('*')
    .in('id', ids)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateRegistration(
  id: string,
  patch: { status?: RegistrationStatus; notes?: string | null },
) {
  const { data, error } = await supabaseAdmin
    .from('event_registrations')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Registration not found');
  return data;
}

export async function deleteRegistration(id: string) {
  const { data, error } = await supabaseAdmin
    .from('event_registrations')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Registration not found');
}
