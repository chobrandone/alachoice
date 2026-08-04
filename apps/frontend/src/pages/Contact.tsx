import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Container, Section } from '@/components/ui/primitives';
import { PageHero } from '@/components/content/PageHero';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { Socials } from '@/components/layout/Socials';
import { useSiteSettings } from '@/lib/queries';
import { useTranslation as useT } from 'react-i18next';

export default function Contact() {
  const { t } = useTranslation();
  const { i18n } = useT();
  const { data: settings } = useSiteSettings();
  const contact = (settings?.contact ?? {}) as Record<string, string>;

  const mapQuery = encodeURIComponent(contact.address ?? 'Bonaberi, Douala, Cameroon');

  return (
    <>
      <Seo title="Contact Us" description="Get in touch with the ALA team in Douala, Cameroon." />
      <PageHero eyebrow={t('nav.contact')} title="Let's start a conversation" />
      <Section>
        <Container className="grid gap-12 lg:grid-cols-2">
          {/* Form */}
          <div>
            <h2 className="text-h3 font-semibold text-ala-navy">{t('home.inquiryTitle')}</h2>
            <div className="mt-6">
              <InquiryForm />
            </div>
          </div>

          {/* Contact block + map */}
          <div>
            <div className="rounded-card bg-ala-grey-50 p-8">
              <ul className="space-y-5">
                <ContactRow icon={<MapPin />} label={t('footer.headOffice')}>
                  {contact.address ?? 'Bonaberi, Douala, Cameroon'}
                </ContactRow>
                <ContactRow icon={<Phone />} label={t('forms.phone')}>
                  {contact.phone_us && (
                    <a href={`tel:${contact.phone_us}`} className="block hover:text-ala-navy">
                      {contact.phone_us}
                    </a>
                  )}
                  {contact.phone_cm && (
                    <a href={`tel:${contact.phone_cm}`} className="block hover:text-ala-navy">
                      {contact.phone_cm}
                    </a>
                  )}
                  {!contact.phone_us && !contact.phone_cm && (
                    <>
                      <span className="block">+1 945 276 7857</span>
                      <span className="block">+237 676 936 019</span>
                    </>
                  )}
                </ContactRow>
                <ContactRow icon={<Mail />} label={t('forms.email')}>
                  <a
                    href={`mailto:${contact.email ?? 'contacts@alachoice.com'}`}
                    className="hover:text-ala-navy"
                  >
                    {contact.email ?? 'contacts@alachoice.com'}
                  </a>
                </ContactRow>
                <ContactRow icon={<Clock />} label={t('footer.hours')}>
                  {contact.hours ?? 'Mon–Fri 08:00–22:00'}
                </ContactRow>
              </ul>
              <div className="mt-6 border-t border-ala-grey-200 pt-6">
                <Socials settings={settings} className="text-ala-grey-500" iconClass="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-card border border-ala-grey-200">
              <iframe
                title="ALA head office map"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                width="100%"
                height="300"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block"
                lang={i18n.language}
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-4">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ala-navy/5 text-ala-red [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ala-grey-500">{label}</p>
        <div className="mt-0.5 text-ala-navy">{children}</div>
      </div>
    </li>
  );
}
