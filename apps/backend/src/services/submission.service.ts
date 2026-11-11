import { supabaseAdmin } from '../lib/supabase.js';
import { sendMail } from '../lib/mailer.js';
import { verifyRecaptcha } from '../lib/recaptcha.js';
import { BadRequest } from '../utils/errors.js';
import { createLeadFromSubmission } from './lead.service.js';
import type { InquiryInput, NewsletterInput, QuoteRequestInput } from '@ala/types';

/**
 * Spam gate: honeypot (`company` must be empty) + Google reCAPTCHA v3.
 * reCAPTCHA is skipped when no secret is configured (see verifyRecaptcha).
 */
async function assertHuman(company?: string, token?: string) {
  if (company && company.trim().length > 0) throw BadRequest('Spam detected');
  const ok = await verifyRecaptcha(token);
  if (!ok) throw BadRequest('reCAPTCHA verification failed. Please try again.');
}

/** Fire-and-forget CRM lead creation; never breaks the submission. */
function seedLead(...args: Parameters<typeof createLeadFromSubmission>) {
  createLeadFromSubmission(...args).catch((e) =>
    console.error('[lead] failed to create from submission', e),
  );
}

async function serviceTitle(service_id?: string | null): Promise<string | null> {
  if (!service_id) return null;
  const { data } = await supabaseAdmin
    .from('services')
    .select('title_en')
    .eq('id', service_id)
    .maybeSingle();
  return data?.title_en ?? null;
}

/** Auto-acknowledgement sent to the person who submitted the form. */
async function sendAutoResponse(name: string, email: string, service: string | null) {
  const about = service ? ` regarding <strong>${service}</strong>` : '';
  const aboutText = service ? ` regarding ${service}` : '';
  await sendMail({
    to: email,
    subject: 'Thank you for contacting American Liaison in Africa',
    text:
      `Dear ${name},\n\n` +
      `Thank you for reaching out to American Liaison in Africa${aboutText}. ` +
      `We have received your message and a member of our team will get back to you shortly.\n\n` +
      `Warm regards,\nThe ALA Team\ncontacts@alachoice.com`,
    html:
      `<div style="font-family:Arial,sans-serif;color:#0F172A;line-height:1.6">` +
      `<p>Dear ${name},</p>` +
      `<p>Thank you for reaching out to <strong>American Liaison in Africa</strong>${about}. ` +
      `We have received your message and a member of our team will get back to you <strong>shortly</strong>.</p>` +
      `<p>Warm regards,<br/>The ALA Team<br/>` +
      `<a href="mailto:contacts@alachoice.com">contacts@alachoice.com</a></p></div>`,
  });
}

export async function createInquiry(input: InquiryInput) {
  await assertHuman(input.company, input.recaptcha_token);
  const { company: _hp, recaptcha_token: _rc, ...payload } = input;
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

  const service = await serviceTitle(input.service_id);
  // Notify the ALA inbox (MAIL_NOTIFY_TO = contacts@alachoice.com)
  await sendMail({
    subject: `New inquiry from ${input.name}`,
    replyTo: input.email,
    text: `Name: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone ?? '—'}\nService: ${service ?? 'General inquiry'}\n\n${input.message}`,
  });
  // Auto-response to the sender
  await sendAutoResponse(input.name, input.email, service);
  return data;
}

export async function createQuote(input: QuoteRequestInput) {
  await assertHuman(input.company, input.recaptcha_token);
  const { company: _hp, recaptcha_token: _rc, ...payload } = input;
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

  const service = await serviceTitle(input.service_id);
  await sendMail({
    subject: `New quote request from ${input.name}`,
    replyTo: input.email,
    text: `Name: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone ?? '—'}\nService: ${service ?? '—'}\nBudget: ${input.budget_range ?? '—'}\n\n${input.details ?? ''}`,
  });
  await sendAutoResponse(input.name, input.email, service);
  return data;
}

export async function subscribeNewsletter(input: NewsletterInput) {
  await assertHuman(input.company, input.recaptcha_token);
  // Idempotent: re-subscribing reactivates rather than erroring on unique email.
  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .upsert({ email: input.email, is_active: true }, { onConflict: 'email' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
