import { env } from '../config/env.js';

const configured = Boolean(env.WHATSAPP_TOKEN && env.WHATSAPP_PHONE_ID);

interface WhatsAppInput {
  to: string; // E.164 without '+', e.g. 237676936019
  text: string;
}

/**
 * Best-effort WhatsApp send via the Meta Cloud API. Mirrors the mailer: if the
 * provider isn't configured, it logs instead of throwing, so the platform runs
 * end-to-end today and starts sending the moment WHATSAPP_TOKEN / WHATSAPP_PHONE_ID
 * are set. Never throws — a messaging failure must not break a request.
 */
export async function sendWhatsApp({ to, text }: WhatsAppInput): Promise<void> {
  const digits = to.replace(/[^\d]/g, '');
  if (!digits) return;
  if (!configured) {
    console.info(`[whatsapp] not configured — would send to ${digits}: "${text.slice(0, 80)}"`);
    return;
  }
  try {
    const res = await fetch(`${env.WHATSAPP_API_URL}/${env.WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: digits,
        type: 'text',
        text: { body: text },
      }),
    });
    if (!res.ok) console.error('[whatsapp] send failed:', res.status, await res.text().catch(() => ''));
  } catch (err) {
    console.error('[whatsapp] send error:', err);
  }
}

export const whatsappConfigured = configured;
