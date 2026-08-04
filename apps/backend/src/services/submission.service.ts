import { supabaseAdmin } from '../lib/supabase.js';
import { sendMail } from '../lib/mailer.js';
import { BadRequest } from '../utils/errors.js';
import { createLeadFromSubmission } from './lead.service.js';
import type { InquiryInput, NewsletterInput, QuoteRequestInput } from '@ala/types';

/** Honeypot: the hidden `company` field must be empty for a human. */
function assertHuman(company?: string) {
  if (company && company.trim().length > 0) throw BadRequest('Spam detected');
}

/** Fire-and-forget CRM lead creation; never breaks the submission. */
function seedLead(...args: Parameters<typeof createLeadFromSubmission>) {
  createLeadFromSubmission(...args).catch((e) =>
    console.error('[lead] failed to create from submission', e),
  );
}

export async function createInquiry(input: InquiryInput) {
  assertHuman(input.company);
  const { company: _hp, ...payload } = input;
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .insert({ ...payload, source: payload.source ?? 'website' })
    .select('*')
    .single();
  if (error) throw error;

  seedLead('inquiry', data.id, {
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    subject: input.message.slice(0, 200),
  });

  await sendMail({
    subject: `New inquiry from ${input.name}`,
    replyTo: input.email,
    text: `Name: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone ?? '—'}\n\n${input.message}`,
  });
  return data;
}

export async function createQuote(input: QuoteRequestInput) {
  assertHuman(input.company);
  const { company: _hp, ...payload } = input;
  const { data, error } = await supabaseAdmin
    .from('quote_requests')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;

  seedLead('quote', data.id, {
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    subject: `Quote request${input.budget_range ? ` · ${input.budget_range}` : ''}`,
  });

  await sendMail({
    subject: `New quote request from ${input.name}`,
    replyTo: input.email,
    text: `Name: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone ?? '—'}\nBudget: ${input.budget_range ?? '—'}\n\n${input.details ?? ''}`,
  });
  return data;
}

export async function subscribeNewsletter(input: NewsletterInput) {
  assertHuman(input.company);
  // Idempotent: re-subscribing reactivates rather than erroring on unique email.
  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .upsert({ email: input.email, is_active: true }, { onConflict: 'email' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
