import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '@/components/Seo';
import { Container, Section } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { ServiceBody } from '@/components/content/ServiceBody';
import { PageHero } from '@/components/content/PageHero';
import { usePage } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';

export default function Ata() {
  const { t } = useTranslation();
  const localized = useLocalized();
  const { data: page } = usePage('ata');

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
          <div className="mt-10">
            <Button asChild size="lg">
              <Link to="/contact">{t('common.register')}</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
