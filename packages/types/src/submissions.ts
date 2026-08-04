import { z } from 'zod';
import { baseRow, uuid, submissionStatus } from './common.js';

/* ============================================================================
 * INQUIRIES (public contact / inquiry form)
 * ==========================================================================*/
export const inquiry = baseRow.extend({
  name: z.string().min(1).max(160),
  email: z.string().email().max(240),
  phone: z.string().max(40).nullish(),
  service_id: uuid.nullish(),
  message: z.string().min(1).max(5000),
  source: z.string().max(60).default('website'),
  status: submissionStatus.default('new'),
});

/** Public submission payload. `company` is a honeypot — must stay empty. */
export const inquiryInput = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(240),
  phone: z.string().trim().max(40).optional(),
  service_id: uuid.optional(),
  message: z.string().trim().min(1).max(5000),
  source: z.string().max(60).optional(),
  company: z.string().max(0).optional(), // honeypot: bots fill it, humans don't
});

export const inquiryStatusUpdate = z.object({ status: submissionStatus });
export type Inquiry = z.infer<typeof inquiry>;
export type InquiryInput = z.infer<typeof inquiryInput>;

/* ============================================================================
 * NEWSLETTER
 * ==========================================================================*/
export const newsletterSubscriber = baseRow.extend({
  email: z.string().email().max(240),
  is_active: z.boolean().default(true),
});
export const newsletterInput = z.object({
  email: z.string().trim().email().max(240),
  company: z.string().max(0).optional(), // honeypot
});
export type NewsletterSubscriber = z.infer<typeof newsletterSubscriber>;
export type NewsletterInput = z.infer<typeof newsletterInput>;

/* ============================================================================
 * QUOTE REQUESTS
 * ==========================================================================*/
export const quoteRequest = baseRow.extend({
  name: z.string().min(1).max(160),
  email: z.string().email().max(240),
  phone: z.string().max(40).nullish(),
  service_id: uuid.nullish(),
  budget_range: z.string().max(80).nullish(),
  details: z.string().max(5000).nullish(),
  status: submissionStatus.default('new'),
});
export const quoteRequestInput = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(240),
  phone: z.string().trim().max(40).optional(),
  service_id: uuid.optional(),
  budget_range: z.string().trim().max(80).optional(),
  details: z.string().trim().max(5000).optional(),
  company: z.string().max(0).optional(), // honeypot
});
export const quoteStatusUpdate = z.object({ status: submissionStatus });
export type QuoteRequest = z.infer<typeof quoteRequest>;
export type QuoteRequestInput = z.infer<typeof quoteRequestInput>;
