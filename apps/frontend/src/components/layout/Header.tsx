import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ChevronDown, Mail, Phone } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Container } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Socials } from './Socials';
import { useServices, useSiteSettings } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';
import { cn } from '@/lib/cn';

export function Header() {
  const { t } = useTranslation();
  const localized = useLocalized();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { data: services } = useServices();
  const { data: settings } = useSiteSettings();
  const contact = (settings?.contact ?? {}) as Record<string, string>;

  // Home hero is dark; header is transparent until scrolled. Other pages: always solid.
  const isHome = pathname === '/';
  const solid = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/services', label: t('nav.services'), hasDropdown: true },
    { to: '/ata', label: t('nav.ata') },
    { to: '/countries', label: t('nav.countries') },
    { to: '/events', label: t('nav.events') },
    { to: '/news', label: t('nav.news') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header
      style={{ top: 'var(--ala-banner-h, 0px)' }}
      className={cn(
        'fixed inset-x-0 z-50 transition-colors duration-300',
        solid ? 'bg-ala-navy shadow-soft' : 'bg-transparent',
      )}
    >
      {/* Utility bar */}
      <div className={cn('hidden border-b border-white/10 lg:block', !solid && 'bg-black/20')}>
        <Container className="flex h-10 items-center justify-between text-xs text-white/80">
          <div className="flex items-center gap-5">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-white">
                <Mail className="h-3.5 w-3.5" /> {contact.email}
              </a>
            )}
            {contact.phone_us && (
              <a href={`tel:${contact.phone_us}`} className="flex items-center gap-1.5 hover:text-white">
                <Phone className="h-3.5 w-3.5" /> {contact.phone_us}
              </a>
            )}
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher invert />
            <Socials settings={settings} className="text-white/70" iconClass="h-3.5 w-3.5" />
          </div>
        </Container>
      </div>

      {/* Main bar */}
      <Container className="flex h-16 items-center justify-between gap-6 md:h-20">
        <Link to="/" className="flex items-center gap-2 text-white" aria-label="ALA home">
          <span className="font-heading text-lg font-bold tracking-tight">
            ALA<span className="text-ala-red">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <div
              key={item.to}
              className="relative"
              onMouseEnter={() => item.hasDropdown && setServicesOpen(true)}
              onMouseLeave={() => item.hasDropdown && setServicesOpen(false)}
            >
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:text-white',
                    isActive && 'text-white',
                  )
                }
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="h-3.5 w-3.5" aria-hidden />}
              </NavLink>
              {item.hasDropdown && servicesOpen && services && services.length > 0 && (
                <div className="absolute left-0 top-full w-64 rounded-card bg-white p-2 shadow-soft-lg">
                  {services.map((s) => (
                    <Link
                      key={s.id}
                      to={`/services/${s.slug}`}
                      className="block rounded-md px-3 py-2 text-sm text-ala-ink hover:bg-ala-grey-50"
                    >
                      {localized(s, 'title')}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to="/portal"
            className="text-sm font-medium text-white/85 transition-colors hover:text-white"
          >
            {t('nav.portal')}
          </Link>
          <Button asChild variant="primary" size="sm">
            <Link to="/contact">{t('nav.getQuote')}</Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <MobileNav navItems={navItems} services={services} localized={localized} />
      </Container>
    </header>
  );
}

function MobileNav({
  navItems,
  services,
  localized,
}: {
  navItems: { to: string; label: string; hasDropdown?: boolean }[];
  services?: { id: string; slug: string; title_en: string }[];
  localized: ReturnType<typeof useLocalized>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="text-white lg:hidden" aria-label={t('common.menu')}>
          <Menu className="h-6 w-6" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-ala-navy p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="font-heading text-lg font-bold">
              ALA<span className="text-ala-red">.</span>
            </span>
            <Dialog.Close aria-label={t('common.close')}>
              <X className="h-6 w-6" />
            </Dialog.Close>
          </div>
          <Dialog.Title className="sr-only">{t('common.menu')}</Dialog.Title>
          <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Mobile">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-4 font-heading text-xl"
              >
                {item.label}
              </Link>
            ))}
            {services && services.length > 0 && (
              <div className="mt-2 pl-2 text-sm text-white/70">
                {services.map((s) => (
                  <Link
                    key={s.id}
                    to={`/services/${s.slug}`}
                    onClick={() => setOpen(false)}
                    className="block py-2"
                  >
                    — {localized(s, 'title')}
                  </Link>
                ))}
              </div>
            )}
          </nav>
          <Link
            to="/portal"
            onClick={() => setOpen(false)}
            className="border-b border-white/10 py-4 font-heading text-xl"
          >
            {t('nav.portal')}
          </Link>
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <LanguageSwitcher invert />
            <Button asChild variant="primary" size="sm">
              <Link to="/contact" onClick={() => setOpen(false)}>
                {t('nav.getQuote')}
              </Link>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
