import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter =
  env.SMTP_HOST && env.SMTP_PORT
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      })
    : null;

interface MailInput {
  to?: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

/**
 * Best-effort email. If SMTP is unconfigured, logs instead of throwing so
 * that a submission is never lost just because mail is down.
 */
export async function sendMail({ to, subject, text, html, replyTo }: MailInput): Promise<void> {
  if (!transporter) {
    console.info(`[mailer] SMTP not configured — would send "${subject}" to ${to ?? env.MAIL_NOTIFY_TO}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: to ?? env.MAIL_NOTIFY_TO,
      subject,
      text,
      html,
      replyTo,
    });
  } catch (err) {
    console.error('[mailer] send failed:', err);
  }
}
