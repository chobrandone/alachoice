import { useState } from 'react';
import { MessageCircle, Phone, Mail, X } from 'lucide-react';
import { useSiteSettings } from '@/lib/queries';
import { cn } from '@/lib/cn';

/**
 * Floating "chat with us" widget on every public page. Expands to WhatsApp,
 * call, and email quick actions using the numbers from site settings.
 */
export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const { data: settings } = useSiteSettings();
  const contact = (settings?.contact ?? {}) as Record<string, string>;

  const waNumber = (contact.whatsapp || contact.phone_cm || contact.phone_us || '').replace(/[^\d]/g, '');
  const phone = contact.phone_cm || contact.phone_us || '';
  const email = contact.email || '';

  const actions = [
    waNumber && {
      key: 'wa',
      label: 'WhatsApp',
      href: `https://wa.me/${waNumber}?text=${encodeURIComponent("Hello ALA, I'd like some information.")}`,
      external: true,
      icon: MessageCircle,
      cls: 'bg-[#25D366] text-white',
    },
    phone && { key: 'call', label: 'Call us', href: `tel:${phone.replace(/\s+/g, '')}`, icon: Phone, cls: 'bg-ala-navy text-white' },
    email && { key: 'mail', label: 'Email us', href: `mailto:${email}`, icon: Mail, cls: 'bg-ala-red text-white' },
  ].filter(Boolean) as { key: string; label: string; href: string; external?: boolean; icon: typeof Phone; cls: string }[];

  if (actions.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {/* Expanded actions */}
      <div
        className={cn(
          'flex flex-col items-end gap-2 transition-all duration-200',
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
        )}
      >
        {actions.map((a) => (
          <a
            key={a.key}
            href={a.href}
            target={a.external ? '_blank' : undefined}
            rel={a.external ? 'noopener noreferrer' : undefined}
            className="flex items-center gap-2 rounded-full bg-white py-2 pl-4 pr-2 text-sm font-medium text-ala-navy shadow-soft-lg ring-1 ring-black/5 hover:shadow-soft"
          >
            {a.label}
            <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', a.cls)}>
              <a.icon className="h-5 w-5" />
            </span>
          </a>
        ))}
      </div>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat menu' : 'Chat with us'}
        aria-expanded={open}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full text-white shadow-soft-lg transition-transform hover:scale-105',
          open ? 'bg-ala-navy' : 'bg-[#25D366]',
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  );
}
