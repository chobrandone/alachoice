import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Clock } from 'lucide-react';
import { Container } from '@/components/ui/primitives';
import { Socials } from './Socials';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { useServices, useSiteSettings } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';

export function Footer() {
  const { t } = useTranslation();
  const localized = useLocalized();
  const { data: services } = useServices();
  const { data: settings } = useSiteSettings();
  const contact = (settings?.contact ?? {}) as Record<string, string>;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ala-navy-deep text-white/80">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="font-heading text-2xl font-bold text-white">
            ALA<span className="text-ala-red">.</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {(settings?.brand?.blurb as string) ??
              'American Liaison in Africa — bridging Cameroon, Africa, and the United States through trusted business consultancy.'}
          </p>
          <Socials settings={settings} className="mt-6 text-white/70" />
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
            {t('footer.quickLinks')}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: '/about', label: t('nav.about') },
              { to: '/services', label: t('nav.services') },
              { to: '/countries', label: t('nav.countries') },
              { to: '/events', label: t('nav.events') },
              { to: '/gallery', label: t('nav.gallery') },
              { to: '/news', label: t('nav.news') },
              { to: '/testimonials', label: t('nav.testimonials') },
              { to: '/contact', label: t('nav.contact') },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
            {t('footer.consultingServices')}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {(services ?? []).slice(0, 5).map((s) => (
              <li key={s.id}>
                <Link to={`/services/${s.slug}`} className="hover:text-white">
                  {localized(s, 'title')}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
            {t('footer.headOffice')}
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ala-red" />
              <span>{contact.address ?? 'Bonaberi, Douala, Cameroon'}</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ala-red" />
              <a href={`mailto:${contact.email ?? 'contacts@alachoice.com'}`} className="hover:text-white">
                {contact.email ?? 'contacts@alachoice.com'}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ala-red" />
              <span>{contact.hours ?? t('footer.hours')}</span>
            </li>
          </ul>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/60 sm:flex-row">
          <p>© {year} American Liaison in Africa. {t('footer.rights')}</p>
          <p>Bonaberi, Douala · Cameroon</p>
        </Container>
      </div>
    </footer>
  );
}
