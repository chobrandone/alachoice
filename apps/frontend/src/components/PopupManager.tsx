import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { usePopups } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';
import type { Popup } from '@ala/types';

const VISITED_KEY = 'ala_visited';

function withinWindow(p: Popup): boolean {
  const now = Date.now();
  if (p.starts_at && new Date(p.starts_at).getTime() > now) return false;
  if (p.ends_at && new Date(p.ends_at).getTime() < now) return false;
  return true;
}

function matchesPath(p: Popup, path: string): boolean {
  if (!p.target_paths || !p.target_paths.trim()) return true;
  return p.target_paths
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .some((prefix) => path === prefix || path.startsWith(prefix));
}

function matchesDevice(p: Popup): boolean {
  if (p.device === 'all') return true;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return p.device === 'mobile' ? isMobile : !isMobile;
}

function matchesAudience(p: Popup, wasVisited: boolean): boolean {
  if (p.audience === 'all') return true;
  return p.audience === 'returning' ? wasVisited : !wasVisited;
}

/** Per-frequency "already shown" check. */
function alreadyShown(p: Popup): boolean {
  const key = `ala_popup_${p.id}`;
  if (p.frequency === 'always') return false;
  if (p.frequency === 'session') return sessionStorage.getItem(key) === '1';
  return localStorage.getItem(key) === '1'; // once
}
function markShown(p: Popup) {
  const key = `ala_popup_${p.id}`;
  if (p.frequency === 'session') sessionStorage.setItem(key, '1');
  else if (p.frequency === 'once') localStorage.setItem(key, '1');
}

export function PopupManager() {
  const { pathname } = useLocation();
  const { data } = usePopups();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Popup | null>(null);
  // Capture "returning" status once, before we set the visited flag.
  const wasVisited = useRef<boolean>(
    typeof window !== 'undefined' && localStorage.getItem(VISITED_KEY) === '1',
  );

  useEffect(() => {
    localStorage.setItem(VISITED_KEY, '1');
  }, []);

  // Pick the first eligible popup for the current route.
  const eligible = useMemo(() => {
    return (data ?? [])
      .filter(withinWindow)
      .filter((p) => matchesPath(p, pathname))
      .filter(matchesDevice)
      .filter((p) => matchesAudience(p, wasVisited.current))
      .filter((p) => !alreadyShown(p))
      .sort((a, b) => a.sort_order - b.sort_order)[0] as Popup | undefined;
  }, [data, pathname]);

  // Trigger engine.
  useEffect(() => {
    if (!eligible || open) return;
    const fire = () => {
      setActive(eligible);
      setOpen(true);
      markShown(eligible);
    };

    // Only start once the whole site has finished loading.
    const afterSiteLoad = (cb: () => void) => {
      if (document.readyState === 'complete') {
        cb();
        return () => {};
      }
      window.addEventListener('load', cb, { once: true });
      return () => window.removeEventListener('load', cb);
    };

    if (eligible.trigger === 'load') {
      return afterSiteLoad(fire);
    }
    if (eligible.trigger === 'delay') {
      let timer: ReturnType<typeof setTimeout> | undefined;
      // Wait for site load, THEN wait the admin-configured delay.
      const cleanup = afterSiteLoad(() => {
        timer = setTimeout(fire, Math.max(0, eligible.delay_seconds) * 1000);
      });
      return () => {
        cleanup();
        if (timer) clearTimeout(timer);
      };
    }
    if (eligible.trigger === 'scroll') {
      const onScroll = () => {
        const scrolled =
          (window.scrollY / (document.body.scrollHeight - window.innerHeight || 1)) * 100;
        if (scrolled >= eligible.scroll_percent) {
          fire();
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }
    if (eligible.trigger === 'exit_intent') {
      const onLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          fire();
          document.removeEventListener('mouseout', onLeave);
        }
      };
      document.addEventListener('mouseout', onLeave);
      return () => document.removeEventListener('mouseout', onLeave);
    }
  }, [eligible, open]);

  if (!active) return null;
  return <PopupDialog popup={active} open={open} onOpenChange={setOpen} />;
}

function PopupDialog({
  popup,
  open,
  onOpenChange,
}: {
  popup: Popup;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { t } = useTranslation();
  const localized = useLocalized();
  const title = localized(popup, 'title');
  const body = localized(popup, 'body');
  const ctaLabel = localized(popup, 'cta_label');
  const isInternal = popup.cta_url?.startsWith('/');

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/50 data-[state=open]:animate-fade-up" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[80] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-card bg-white shadow-soft-lg">
          {popup.image_url ? (
            <img src={popup.image_url} alt="" className="h-40 w-full object-cover" />
          ) : (
            <div className="bg-navy-gradient p-6 text-white">
              <Dialog.Title className="font-heading text-2xl font-bold">
                {title || popup.name}
              </Dialog.Title>
            </div>
          )}
          <div className="p-6">
            {popup.image_url && title && (
              <Dialog.Title className="font-heading text-2xl font-bold text-ala-navy">
                {title}
              </Dialog.Title>
            )}
            {!title && (
              <Dialog.Title className="sr-only">{popup.name}</Dialog.Title>
            )}
            {body && (
              <Dialog.Description className="mt-2 text-ala-grey-500">{body}</Dialog.Description>
            )}

            {popup.countdown_to && <Countdown to={popup.countdown_to} />}

            {popup.show_newsletter && (
              <div className="mt-5 rounded-card bg-ala-grey-50 p-4">
                <NewsletterForm />
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {popup.cta_url &&
                (isInternal ? (
                  <Button asChild>
                    <Link to={popup.cta_url} onClick={() => onOpenChange(false)}>
                      {ctaLabel || t('nav.getQuote')}
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <a href={popup.cta_url} target="_blank" rel="noopener noreferrer">
                      {ctaLabel || t('nav.getQuote')}
                    </a>
                  </Button>
                ))}
              <Dialog.Close asChild>
                <Button variant="ghost">{t('common.close')}</Button>
              </Dialog.Close>
            </div>
          </div>
          <Dialog.Close
            aria-label={t('common.close')}
            className="absolute right-3 top-3 rounded-full bg-black/20 p-1 text-white hover:bg-black/40"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  if (diff <= 0) return null;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const units = [
    { v: d, l: 'Days' },
    { v: h, l: 'Hrs' },
    { v: m, l: 'Min' },
    { v: s, l: 'Sec' },
  ];

  return (
    <div className="mt-5 flex justify-center gap-3">
      {units.map((u) => (
        <div key={u.l} className="min-w-[3.5rem] rounded-btn bg-ala-navy px-2 py-2 text-center text-white">
          <p className="font-heading text-xl font-bold tabular-nums">{String(u.v).padStart(2, '0')}</p>
          <p className="text-[0.6rem] uppercase tracking-wide text-white/70">{u.l}</p>
        </div>
      ))}
    </div>
  );
}
