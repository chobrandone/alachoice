import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useSiteSettings } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';

const SEEN_KEY = 'ala_popup_seen';

/** Delayed consultation offer — once per session, toggled + copy from settings. */
export function ConsultationPopup() {
  const { t } = useTranslation();
  const localized = useLocalized();
  const { data: settings } = useSiteSettings();
  const popup = (settings?.popup ?? {}) as Record<string, unknown>;
  const [open, setOpen] = useState(false);

  const enabled = popup.enabled === true;
  const delay = typeof popup.delay_ms === 'number' ? popup.delay_ms : 8000;

  useEffect(() => {
    if (!enabled) return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    const id = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SEEN_KEY, '1');
    }, delay);
    return () => clearTimeout(id);
  }, [enabled, delay]);

  if (!enabled) return null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 data-[state=open]:animate-fade-up" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-card bg-white shadow-soft-lg">
          <div className="bg-navy-gradient p-6 text-white">
            <Dialog.Title className="font-heading text-2xl font-bold">
              {localized(popup as Record<string, unknown>, 'title') || 'Free Consultation'}
            </Dialog.Title>
          </div>
          <div className="p-6">
            <Dialog.Description className="text-ala-grey-500">
              {localized(popup as Record<string, unknown>, 'body') ||
                'Schedule a free consultation with our team today.'}
            </Dialog.Description>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link to="/contact" onClick={() => setOpen(false)}>
                  {t('nav.getQuote')}
                </Link>
              </Button>
              <Dialog.Close asChild>
                <Button variant="ghost">{t('common.close')}</Button>
              </Dialog.Close>
            </div>
          </div>
          <Dialog.Close
            aria-label={t('common.close')}
            className="absolute right-4 top-4 text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
