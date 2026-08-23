import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  /** Public front-end base URL — used for sitemap <loc> entries. */
  SITE_URL: z.string().url().default('http://localhost:5173'),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('ALA Website <no-reply@alachoice.com>'),
  MAIL_NOTIFY_TO: z.string().default('contacts@alachoice.com'),

  // WhatsApp Cloud API (optional — messaging no-ops with a log until configured).
  WHATSAPP_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_ID: z.string().optional(),
  WHATSAPP_API_URL: z.string().default('https://graph.facebook.com/v20.0'),

  // Automation scheduler.
  REMINDERS_ENABLED: z.coerce.boolean().default(true),
  REMINDER_INTERVAL_MS: z.coerce.number().default(60 * 60 * 1000),
  /** Shared secret for the Vercel Cron reminder endpoint (Bearer token). */
  CRON_SECRET: z.string().optional(),

  PUBLIC_RATE_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  PUBLIC_RATE_MAX: z.coerce.number().default(30),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast with a readable message. Throw (not process.exit) so serverless
  // hosts can surface it as a proper 500 instead of an opaque crash.
  const fields = parsed.error.flatten().fieldErrors;
  console.error('❌ Invalid environment configuration:', fields);
  throw new Error('Invalid environment configuration: ' + JSON.stringify(fields));
}

export const env = parsed.data;
export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((o) => o.trim())
  .filter(Boolean);
export const isProd = env.NODE_ENV === 'production';
