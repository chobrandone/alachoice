import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Phone } from 'lucide-react';
import { Container } from '@/components/ui/primitives';
import { Socials } from './Socials';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { useSiteSettings } from '@/lib/queries';

export function Footer() {
  const { t, i18n } = useTranslation();
  const { data: settings } = useSiteSettings();
  const contact = (settings?.contact ?? {}) as Record<string, string>;
  const year = new Date().getFullYear();
  const fr = i18n.language?.startsWith('fr');
  const tr = (en: string, frr: string) => (fr ? frr : en);

  const quickLinks = [
    { to: '/about', label: t('nav.about') },
    { to: '/services', label: t('nav.services') },
    { to: '/ata', label: t('nav.ata') },
    { to: '/events', label: t('nav.events') },
    { to: '/news', label: t('nav.news') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <footer className="bg-ala-navy-deep text-white/80">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link to="/" className="font-heading text-2xl font-bold text-white">
            ALA<span className="text-ala-cta">.</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {(settings?.brand?.blurb as string) ??
              'American Liaison in Africa is a U.S.–Africa business consulting firm helping companies trade, enter new markets and invest across borders.'}
          </p>
          <Socials settings={settings} className="mt-6 text-white/70" />
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
            {t('footer.quickLinks')}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Offices */}
        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
            {tr('Our offices', 'Nos bureaux')}
          </h3>
          <div className="mt-4 space-y-5 text-sm">
            <div>
              <p className="font-semibold text-white">{tr('U.S. Office', 'Bureau États-Unis')}</p>
              <p className="mt-1 flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ala-cta" />
                <span>{tr('Address coming soon', 'Adresse à venir')}</span>
              </p>
              {contact.phone_us && (
                <p className="mt-1 flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ala-cta" />
                  <a href={`tel:${contact.phone_us}`} className="hover:text-white">
                    {contact.phone_us}
                  </a>
                </p>
              )}
            </div>
            <div>
              <p className="font-semibold text-white">{tr('Douala Office', 'Bureau Douala')}</p>
              <p className="mt-1 flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ala-cta" />
                <span>{contact.address ?? 'Bonaberi, Douala, Cameroon'}</span>
              </p>
              {contact.phone_cm && (
                <p className="mt-1 flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ala-cta" />
                  <a href={`tel:${contact.phone_cm}`} className="hover:text-white">
                    {contact.phone_cm}
                  </a>
                </p>
              )}
            </div>
            <p className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ala-cta" />
              <a href={`mailto:${contact.email ?? 'contacts@alachoice.com'}`} className="hover:text-white">
                {contact.email ?? 'contacts@alachoice.com'}
              </a>
            </p>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
            {tr('Join our newsletter', 'Rejoignez notre newsletter')}
          </h3>
          <p className="mt-3 text-sm leading-relaxed">
            {tr(
              'Get our monthly trade & investment insights and ALA updates — straight to your inbox.',
              'Recevez chaque mois nos analyses commerce & investissement et les actualités d’ALA — directement dans votre boîte mail.',
            )}
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/60 sm:flex-row">
          <p>
            © {year} American Liaison in Africa. {t('footer.rights')}
          </p>
          <p>{tr('U.S. · Douala, Cameroon', 'États-Unis · Douala, Cameroun')}</p>
        </Container>
      </div>
    </footer>
  );
}
