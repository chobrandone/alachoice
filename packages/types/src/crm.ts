import { z } from 'zod';
import { timestamped, baseRow, uuid, isoDate } from './common.js';

export const leadSource = z.enum(['inquiry', 'quote', 'application', 'event_registration', 'manual']);
export type LeadSource = z.infer<typeof leadSource>;

export const leadStatus = z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']);
export type LeadStatus = z.infer<typeof leadStatus>;

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  inquiry: 'Inquiry',
  quote: 'Quote request',
  application: 'Application',
  event_registration: 'Event registration',
  manual: 'Manual',
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
};

/* ---- Lead ---- */
export const lead = timestamped.extend({
  source: leadSource.default('manual'),
  source_id: uuid.nullish(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(240).nullish(),
  phone: z.string().max(40).nullish(),
  country: z.string().max(120).nullish(),
  subject: z.string().max(400).nullish(),
  status: leadStatus.default('new'),
  assigned_to: uuid.nullish(),
  value: z.number().nullish(),
});
export type Lead = z.infer<typeof lead>;

/** Manual lead creation (admin). */
export const leadInput = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(240).optional(),
  phone: z.string().trim().max(40).optional(),
  country: z.string().trim().max(120).optional(),
  subject: z.string().trim().max(400).optional(),
  status: leadStatus.default('new'),
  assigned_to: uuid.nullish().optional(),
  value: z.number().nullish().optional(),
});
export type LeadInput = z.infer<typeof leadInput>;

export const leadUpdate = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email().max(240).nullish().optional(),
  phone: z.string().trim().max(40).nullish().optional(),
  country: z.string().trim().max(120).nullish().optional(),
  subject: z.string().trim().max(400).nullish().optional(),
  status: leadStatus.optional(),
  assigned_to: uuid.nullish().optional(),
  value: z.number().nullish().optional(),
});
export type LeadUpdate = z.infer<typeof leadUpdate>;

/* ---- Notes ---- */
export const leadNote = baseRow.extend({
  lead_id: uuid,
  admin_user_id: uuid.nullish(),
  body: z.string().min(1),
});
export const leadNoteInput = z.object({ body: z.string().trim().min(1).max(5000) });
export type LeadNote = z.infer<typeof leadNote>;
export type LeadNoteInput = z.infer<typeof leadNoteInput>;

/* ---- Tasks (follow-ups) ---- */
export const leadTask = timestamped.extend({
  lead_id: uuid,
  admin_user_id: uuid.nullish(),
  title: z.string().min(1).max(300),
  due_at: isoDate.nullish(),
  is_done: z.boolean().default(false),
});
export const leadTaskInput = z.object({
  title: z.string().trim().min(1).max(300),
  due_at: isoDate.nullish().optional(),
});
export const leadTaskUpdate = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  due_at: isoDate.nullish().optional(),
  is_done: z.boolean().optional(),
});
export type LeadTask = z.infer<typeof leadTask>;
export type LeadTaskInput = z.infer<typeof leadTaskInput>;
export type LeadTaskUpdate = z.infer<typeof leadTaskUpdate>;

/** Full lead detail: the lead + its notes, tasks, and origin summary. */
export interface LeadDetail extends Lead {
  notes: LeadNote[];
  tasks: LeadTask[];
}
