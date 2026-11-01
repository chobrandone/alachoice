import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Container, Section } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { ServiceBody } from '@/components/content/ServiceBody';
import { PageHero } from '@/components/content/PageHero';
import { usePage } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';

export default function Ata() {
  const { i18n } = useTranslation();
  const localized = useLocalized();
  const { data: page } = usePage('ata');
  const fr = i18n.language?.startsWith('fr');
  const tr = (en: string, frr: string) => (fr ? frr : en);

  return (
    <>
      <Seo title="ATA" description={localized(page, 'seo_description') || 'The ATA programme.'} />
      <PageHero
        eyebrow="Programme"
        title={localized(page, 'title') || 'ATA'}
        intro={localized(page, 'seo_description') || undefined}
        image={page?.hero_image_url}
      />
      <Section>
        <Container className="max-w-5xl">
          {page?.body_en ? (
            <ServiceBody html={localized(page, 'body')} />
          ) : (
            <p className="text-body text-ala-grey-500">
              Programme details are being updated. Please check back soon or contact us for more
              information.
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link to="/b2b-platform">
                {tr('Enter the B2B Trade Platform', 'Accéder à la plateforme commerciale B2B')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline-navy">
              <Link to="/contact">{tr('Join the programme', 'Rejoindre le programme')}</Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* B2B Trade Platform hand-off */}
      <Section tone="navy">
        <Container className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="eyebrow text-ala-gold">
              {tr('From readiness to real deals', 'De la préparation aux transactions réelles')}
            </p>
            <h2 className="mt-3 text-h2 text-white">
              {tr('Continue on the B2B Trade Platform', 'Continuez sur la plateforme commerciale B2B')}
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              {tr(
                'Once you are export-ready, the ALA B2B Trade Platform connects you with verified international buyers — and supports every deal from introduction to delivery.',
                'Une fois prêt à l’export, la plateforme commerciale B2B d’ALA vous connecte avec des acheteurs internationaux vérifiés — et accompagne chaque transaction de l’introduction à la livraison.',
              )}
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Button asChild size="lg">
              <Link to="/b2b-platform">
                {tr('Open the platform', 'Ouvrir la plateforme')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
