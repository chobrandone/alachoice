import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useAnnouncements } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';
import { cn } from '@/lib/cn';
import type { Announcement, AnnouncementStyle } from '@ala/types';

const DISMISS_KEY = 'ala_dismissed_announcements';

const STYLE_CLS: Record<AnnouncementStyle, string> = {
  info: 'bg-ala-navy text-white',
  success: 'bg-emerald-600 text-white',
  warning: 'bg-amber-400 text-ala-navy',
  promo: 'bg-gradient-to-r from-ala-red to-ala-gold text-white',
};

function withinWindow(a: Announcement): boolean {
  const now = Date.now();
  if (a.starts_at && new Date(a.starts_at).getTime() > now) return false;
  if (a.ends_at && new Date(a.ends_at).getTime() < now) return false;
  return true;
}

function readDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

/** Persistent, admin-managed top-of-site banner. Rotates when several are active. */
export function AnnouncementBar() {
  const localized = useLocalized();
  const { data } = useAnnouncements();
  const ref = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);
  const [index, setIndex] = useState(0);

  const active = (data ?? [])
    .filter(withinWindow)
    .filter((a) => !dismissed.includes(a.id))
    .sort((x, y) => x.sort_order - y.sort_order);

  const count = active.length;

  // Rotate through multiple announcements.
  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [count]);

  // Publish the banner height so the fixed header can sit below it.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const h = count > 0 && ref.current ? ref.current.offsetHeight : 0;
    root.style.setProperty('--ala-banner-h', `${h}px`);
    return () => root.style.setProperty('--ala-banner-h', '0px');
  }, [count, index]);

  if (count === 0) return null;

  const current = active[Math.min(index, count - 1)];
  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
    setIndex(0);
  };

  const message = localized(current, 'message');
  const linkLabel = localized(current, 'link_label');

  return (
    <div
      ref={ref}
      className={cn(
        'fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-3 px-4 py-2 text-center text-sm font-medium',
        STYLE_CLS[current.style],
      )}
      role="region"
      aria-label="Site announcement"
    >
      <p className="flex flex-wrap items-center justify-center gap-x-2">
        <span>{message}</span>
        {current.link_url && (
          <a
            href={current.link_url}
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-90"
          >
            {linkLabel || 'Learn more'}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        )}
      </p>
      {count > 1 && (
        <span className="hidden gap-1 sm:flex" aria-hidden>
          {active.map((_, i) => (
            <span
              key={i}
              className={cn('h-1.5 w-1.5 rounded-full', i === index ? 'bg-current' : 'bg-current/40')}
            />
          ))}
        </span>
      )}
      {current.dismissible && (
        <button
          type="button"
          onClick={() => dismiss(current.id)}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
