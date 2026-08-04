import { supabaseAdmin } from '../lib/supabase.js';
import { sendMail } from '../lib/mailer.js';
import { NotFound, BadRequest } from '../utils/errors.js';
import type { AppointmentBookInput, AppointmentAdminUpdate } from '@ala/types';

/* ---- Slots (public/portal read) ---- */
export async function listOpenSlots() {
  const { data, error } = await supabaseAdmin
    .from('availability_slots')
    .select('*, consultant:team_members(full_name)')
    .eq('is_active', true)
    .eq('is_booked', false)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/* ---- Client-scoped ---- */
export async function listAppointments(clientId: string) {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select('*, service:services(title_en), consultant:team_members(full_name)')
    .eq('client_id', clientId)
    .order('scheduled_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function bookAppointment(
  clientId: string,
  clientEmail: string,
  input: AppointmentBookInput,
) {
  // Lock the slot: only book if still open.
  const { data: slot, error: slotErr } = await supabaseAdmin
    .from('availability_slots')
    .select('*')
    .eq('id', input.slot_id)
    .maybeSingle();
  if (slotErr) throw slotErr;
  if (!slot || !slot.is_active) throw NotFound('Slot not available');
  if (slot.is_booked) throw BadRequest('That time has just been booked, please pick another');

  const mark = await supabaseAdmin
    .from('availability_slots')
    .update({ is_booked: true })
    .eq('id', slot.id)
    .eq('is_booked', false)
    .select('id')
    .maybeSingle();
  if (mark.error) throw mark.error;
  if (!mark.data) throw BadRequest('That time has just been booked, please pick another');

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .insert({
      client_id: clientId,
      slot_id: slot.id,
      service_id: input.service_id ?? null,
      consultant_id: slot.consultant_id,
      scheduled_at: slot.starts_at,
      duration_minutes: slot.duration_minutes,
      mode: input.mode,
      status: 'requested',
      notes: input.notes ?? null,
    })
    .select('*')
    .single();
  if (error) {
    // Roll back the slot hold on failure.
    await supabaseAdmin.from('availability_slots').update({ is_booked: false }).eq('id', slot.id);
    throw error;
  }

  await sendMail({
    to: clientEmail,
    subject: 'Your ALA appointment request',
    text:
      `We've received your appointment request for ${new Date(slot.starts_at).toLocaleString()} ` +
      `(${input.mode}). An advisor will confirm shortly.\n\n— American Liaison in Africa`,
  });
  await sendMail({
    subject: `New appointment request (${new Date(slot.starts_at).toLocaleString()})`,
    replyTo: clientEmail,
    text: `A client requested an appointment. Mode: ${input.mode}.`,
  });
  return data;
}

export async function cancelAppointment(clientId: string, id: string) {
  const { data: appt, error } = await supabaseAdmin
    .from('appointments')
    .select('*')
    .eq('id', id)
    .eq('client_id', clientId)
    .maybeSingle();
  if (error) throw error;
  if (!appt) throw NotFound('Appointment not found');
  if (['completed', 'cancelled'].includes(appt.status))
    throw BadRequest('This appointment can no longer be cancelled');

  const { data, error: updErr } = await supabaseAdmin
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('client_id', clientId)
    .select('*')
    .single();
  if (updErr) throw updErr;

  // Free the slot for others.
  if (appt.slot_id)
    await supabaseAdmin.from('availability_slots').update({ is_booked: false }).eq('id', appt.slot_id);
  return data;
}

/* ---- Admin ---- */
export async function adminListAppointments(opts: { status?: string; page: number; pageSize: number }) {
  let q = supabaseAdmin
    .from('appointments')
    .select('*, client:clients(full_name, email), service:services(title_en), consultant:team_members(full_name)', {
      count: 'exact',
    });
  if (opts.status) q = q.eq('status', opts.status);
  q = q.order('scheduled_at', { ascending: false });
  const from = (opts.page - 1) * opts.pageSize;
  const { data, error, count } = await q.range(from, from + opts.pageSize - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function adminUpdateAppointment(id: string, patch: AppointmentAdminUpdate) {
  const { data: existing } = await supabaseAdmin
    .from('appointments')
    .select('slot_id, scheduled_at')
    .eq('id', id)
    .maybeSingle();

  const { data, error } = await supabaseAdmin
    .from('appointments')
    .update(patch)
    .eq('id', id)
    .select('*, client:clients(full_name, email)')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Appointment not found');

  // Free the slot when an admin cancels.
  if (patch.status === 'cancelled' && existing?.slot_id)
    await supabaseAdmin.from('availability_slots').update({ is_booked: false }).eq('id', existing.slot_id);

  const email = (data as { client?: { email?: string } }).client?.email;
  if (patch.status && email) {
    const when = new Date(data.scheduled_at).toLocaleString();
    const extra =
      patch.status === 'confirmed'
        ? data.mode === 'online'
          ? `\nJoin link: ${data.meeting_link ?? 'to be shared'}`
          : `\nLocation: ${data.location ?? 'to be shared'}`
        : '';
    await sendMail({
      to: email,
      subject: `Your ALA appointment is ${patch.status}`,
      text: `Your appointment on ${when} is now ${patch.status}.${extra}\n\n— American Liaison in Africa`,
    });
  }
  return data;
}
