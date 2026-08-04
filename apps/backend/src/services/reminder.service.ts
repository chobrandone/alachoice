import { supabaseAdmin } from '../lib/supabase.js';
import { sendMail } from '../lib/mailer.js';
import { sendWhatsApp } from '../lib/whatsapp.js';

/**
 * One reminder pass. Idempotent via `reminder_sent_at` flags, so it is safe to
 * run on an interval. Returns how many reminders were sent.
 */
export async function runReminders(): Promise<{ appointments: number; tasks: number }> {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
  let apptCount = 0;
  let taskCount = 0;

  /* ---- Appointment reminders (confirmed, within 24h, not yet reminded) ---- */
  const { data: appts } = await supabaseAdmin
    .from('appointments')
    .select('*, client:clients(full_name, email, phone)')
    .eq('status', 'confirmed')
    .is('reminder_sent_at', null)
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', in24h);

  for (const a of appts ?? []) {
    const client = (a as { client?: { full_name?: string; email?: string; phone?: string } }).client;
    const when = new Date(a.scheduled_at).toLocaleString();
    const where = a.mode === 'online' ? a.meeting_link ?? 'link to follow' : a.location ?? 'our office';
    const msg = `Reminder: your ALA appointment is on ${when} (${a.mode}). ${a.mode === 'online' ? 'Join: ' : 'Location: '}${where}.`;
    if (client?.email) await sendMail({ to: client.email, subject: 'Reminder: your ALA appointment', text: msg });
    if (client?.phone) await sendWhatsApp({ to: client.phone, text: msg });
    await supabaseAdmin.from('appointments').update({ reminder_sent_at: now.toISOString() }).eq('id', a.id);
    apptCount++;
  }

  /* ---- Follow-up task reminders (due within 24h / overdue, not done) ---- */
  const { data: tasks } = await supabaseAdmin
    .from('lead_tasks')
    .select('*, lead:leads(name, assigned_to), assignee:admin_users(email, full_name)')
    .eq('is_done', false)
    .is('reminder_sent_at', null)
    .not('due_at', 'is', null)
    .lte('due_at', in24h);

  for (const t of tasks ?? []) {
    const lead = (t as { lead?: { name?: string } }).lead;
    const assignee = (t as { assignee?: { email?: string } }).assignee;
    const to = assignee?.email; // admin_user linked to the task
    const msg = `Follow-up due: "${t.title}"${lead?.name ? ` for lead ${lead.name}` : ''} (due ${new Date(t.due_at).toLocaleString()}).`;
    await sendMail({ to, subject: 'ALA follow-up reminder', text: msg });
    await supabaseAdmin.from('lead_tasks').update({ reminder_sent_at: now.toISOString() }).eq('id', t.id);
    taskCount++;
  }

  return { appointments: apptCount, tasks: taskCount };
}
