import { useEffect } from 'react';

/**
 * Google reCAPTCHA v3. Set VITE_RECAPTCHA_SITE_KEY to enable; when unset,
 * getToken() resolves to undefined and the backend skips verification, so
 * forms keep working until keys are configured.
 */
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};
declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

let loadPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (!SITE_KEY) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<void>((resolve) => {
    if (window.grecaptcha) return resolve();
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
  return loadPromise;
}

export function useRecaptcha(): (action: string) => Promise<string | undefined> {
  useEffect(() => {
    void loadScript();
  }, []);

  return async (action: string) => {
    if (!SITE_KEY) return undefined;
    await loadScript();
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) return undefined;
    return new Promise<string | undefined>((resolve) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute(SITE_KEY, { action })
          .then((token) => resolve(token))
          .catch(() => resolve(undefined));
      });
    });
  };
}
