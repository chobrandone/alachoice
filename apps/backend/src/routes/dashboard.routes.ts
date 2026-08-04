import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { runReminders } from '../services/reminder.service.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireAdmin);

async function count(table: string, filter?: (q: any) => any) {
  let q = supabaseAdmin.from(table).select('id', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count: c, error } = await q;
  if (error) throw error;
  return c ?? 0;
}

dashboardRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [newInquiries, upcomingEvents, publishedServices, subscribers, pendingQuotes] =
      await Promise.all([
        count('inquiries', (q) => q.eq('status', 'new')),
        count('events', (q) => q.eq('status', 'upcoming').eq('is_published', true)),
        count('services', (q) => q.eq('is_published', true)),
        count('newsletter_subscribers', (q) => q.eq('is_active', true)),
        count('quote_requests', (q) => q.eq('status', 'new')),
      ]);

    const { data: recentInquiries } = await supabaseAdmin
      .from('inquiries')
      .select('id, name, email, message, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return ok(res, {
      counts: { newInquiries, upcomingEvents, publishedServices, subscribers, pendingQuotes },
      recentInquiries: recentInquiries ?? [],
    });
  }),
);

/* -------------------------------------------------------------------------- */
/* Analytics — aggregates across leads, applications, appointments, events    */
/* -------------------------------------------------------------------------- */
function tally<T extends string>(rows: { [k: string]: unknown }[], key: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const v = (r[key] as T) ?? 'unknown';
    const k = String(v || 'unknown');
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

/** Manually trigger a reminder pass (for admins/testing; also runs on a timer). */
dashboardRouter.post(
  '/run-reminders',
  asyncHandler(async (_req, res) => ok(res, await runReminders())),
);

dashboardRouter.get(
  '/analytics',
  asyncHandler(async (_req, res) => {
    const nowIso = new Date().toISOString();

    // Pull light rows and aggregate in-process (fine at this scale).
    const [
      { data: leads },
      { data: apps },
      { count: clientsN },
      { count: registrationsN },
      { count: inquiriesN },
      { count: quotesN },
      { count: subscribersN },
      { count: upcomingAppointments },
      { count: openTasks },
    ] = await Promise.all([
      supabaseAdmin.from('leads').select('source, status, country, created_at').limit(5000),
      supabaseAdmin.from('applications').select('type, status').limit(5000),
      supabaseAdmin.from('clients').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('event_registrations').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('inquiries').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('quote_requests').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .gte('scheduled_at', nowIso)
        .in('status', ['requested', 'confirmed']),
      supabaseAdmin.from('lead_tasks').select('id', { count: 'exact', head: true }).eq('is_done', false),
    ]);

    const leadRows = leads ?? [];
    const appRows = apps ?? [];

    // Leads over the last 8 weeks (bucket by week start).
    const weeks: { label: string; count: number }[] = [];
    const msWeek = 7 * 24 * 3600 * 1000;
    const now = Date.now();
    for (let i = 7; i >= 0; i--) {
      const start = now - i * msWeek;
      const end = start + msWeek;
      const count = leadRows.filter((l) => {
        const t = new Date(l.created_at as string).getTime();
        return t >= start && t < end;
      }).length;
      weeks.push({ label: new Date(start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), count });
    }

    const totalLeads = leadRows.length;
    const wonLeads = leadRows.filter((l) => l.status === 'won').length;

    const countryTally = tally(leadRows as never, 'country');
    const topCountries = Object.entries(countryTally)
      .filter(([k]) => k !== 'unknown')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));

    return ok(res, {
      totals: {
        leads: totalLeads,
        clients: clientsN ?? 0,
        applications: appRows.length,
        registrations: registrationsN ?? 0,
        inquiries: inquiriesN ?? 0,
        quotes: quotesN ?? 0,
        subscribers: subscribersN ?? 0,
        upcomingAppointments: upcomingAppointments ?? 0,
        openTasks: openTasks ?? 0,
      },
      conversionRate: totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0,
      leadsOverTime: weeks,
      leadsBySource: tally(leadRows as never, 'source'),
      leadsByStatus: tally(leadRows as never, 'status'),
      topCountries,
      applicationsByStatus: tally(appRows as never, 'status'),
      applicationsByType: tally(appRows as never, 'type'),
    });
  }),
);
