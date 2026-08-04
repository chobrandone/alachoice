import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '@/components/Seo';
import { Container, Section } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ServiceBody } from '@/components/content/ServiceBody';
import { PageHero } from '@/components/content/PageHero';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { useService } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';
import { ApiError } from '@/lib/api';

export default function ServiceDetail() {
  const { slug = '' } = useParams();
  const { t } = useTranslation();
  const localized = useLocalized();
  const { data: service, isLoading, error } = useService(slug);

  if (error instanceof ApiError && error.status === 404) return <Navigate to="/services" replace />;

  if (isLoading) {
    return (
      <div className="pt-32">
        <Container>
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="mt-6 h-64 w-full" />
        </Container>
      </div>
    );
  }
  if (!service) return null;

  return (
    <>
      <Seo title={localized(service, 'title')} description={localized(service, 'excerpt')} />
      <PageHero
        eyebrow={t('nav.services')}
        title={localized(service, 'title')}
        intro={localized(service, 'excerpt')}
        image={service.cover_image_url}
      />
      <Section>
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {service.cover_image_url && (
              <img
                src={service.cover_image_url}
                alt={localized(service, 'title')}
                className="mb-8 aspect-[16/9] w-full rounded-card object-cover shadow-soft"
              />
            )}
            <ServiceBody html={localized(service, 'body')} />
          </div>
          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-card border border-ala-grey-200 bg-ala-grey-50 p-6">
              <h3 className="font-heading text-lg font-semibold text-ala-navy">
                Interested in this service?
              </h3>
              <p className="mt-2 text-sm text-ala-grey-500">
                Tell us about your project and we'll respond within one business day.
              </p>
              <Button asChild className="mt-4 w-full">
                <Link to="/contact">{t('nav.getQuote')}</Link>
              </Button>
            </div>
          </aside>
        </Container>
      </Section>
      <Section tone="grey">
        <Container className="max-w-2xl">
          <h2 className="text-h2">{t('home.inquiryTitle')}</h2>
          <div className="mt-8">
            <InquiryForm variant="onGrey" />
          </div>
        </Container>
      </Section>
    </>
  );
}
