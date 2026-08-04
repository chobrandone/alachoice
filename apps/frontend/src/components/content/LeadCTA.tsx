import { Link } from 'react-router-dom';
import { CalendarCheck, Send, MessageCircle, Phone } from 'lucide-react';
import { Container, Section } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { useSiteSettings } from '@/lib/queries';

interface LeadCTAProps {
  title?: string;
  subtitle?: string;
  applyLabel?: string;
  applyHref?: string;
}

/**
 * High-conversion CTA band ending every service / country / news / event page.
 * Book a Consultation · Apply Now · Chat on WhatsApp · Call an Advisor.
 */
export function LeadCTA({
  title = "Let's build your next opportunity",
  subtitle = 'Speak with an ALA advisor and take the first step today.',
  applyLabel = 'Apply Now',
  applyHref = '/contact',
}: LeadCTAProps) {
  const { data: settings } = useSiteSettings();
  const contact = (settings?.contact ?? {}) as Record<string, string>;

  const rawWhats = contact.whatsapp || contact.phone_us || contact.phone_cm || '';
  const whatsDigits = rawWhats.replace(/[^\d]/g, '');
  const phone = contact.phone_us || contact.phone_cm || '';

  return (
    <Section tone="navy" className="py-16 md:py-20">
      <Container className="text-center">
        <h2 className="text-h2 text-white">{title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/80">{subtitle}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/contact">
              <CalendarCheck className="h-5 w-5" /> Book a Consultation
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to={applyHref}>
              <Send className="h-5 w-5" /> {applyLabel}
            </Link>
          </Button>
          {whatsDigits && (
            <Button asChild size="lg" variant="outline">
              <a
                href={`https://wa.me/${whatsDigits}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
              </a>
            </Button>
          )}
          {phone && (
            <Button asChild size="lg" variant="outline">
              <a href={`tel:${phone.replace(/\s+/g, '')}`}>
                <Phone className="h-5 w-5" /> Call an Advisor
              </a>
            </Button>
          )}
        </div>
      </Container>
    </Section>
  );
}
