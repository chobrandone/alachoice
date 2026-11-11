import { env } from '../config/env.js';

/**
 * Verify a Google reCAPTCHA v3 token with Google's siteverify API.
 * - If RECAPTCHA_SECRET is not configured, verification is skipped (returns true)
 *   so the site keeps working until keys are added.
 * - When configured, a missing or low-score token is rejected.
 */
export async function verifyRecaptcha(token?: string): Promise<boolean> {
  if (!env.RECAPTCHA_SECRET) return true; // not configured → don't block submissions
  if (!token) return false;
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env.RECAPTCHA_SECRET, response: token }),
    });
    const data = (await res.json()) as { success: boolean; score?: number };
    // v3 returns a score (0–1); treat >= 0.5 as human. v2 has no score → success is enough.
    return Boolean(data.success) && (data.score === undefined || data.score >= 0.5);
  } catch {
    return false;
  }
}
