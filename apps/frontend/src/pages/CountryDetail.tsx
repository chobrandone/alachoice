import { useParams, Navigate } from 'react-router-dom';
import { Plane, GraduationCap, Wallet, FileCheck, Clock } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Skeleton } from '@/components/ui/Skeleton';
import { RichText } from '@/components/ui/RichText';
import { Accordion } from '@/components/ui/Accordion';
import { PageHero } from '@/components/content/PageHero';
import { LeadCTA } from '@/components/content/LeadCTA';
import { TestimonialCard } from '@/components/content/TestimonialCard';
import { useCountry, useTestimonials } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';
import { ApiError } from '@/lib/api';

export default function CountryDetail() {
  const { slug = '' } = useParams();
  const localized = useLocalized();
  const { data: country, isLoading, error } = useCountry(slug);
  const { data: testimonials } = useTestimonials();

  if (error instanceof ApiError && error.status === 404) return <Navigate to="/countries" replace />;
  if (isLoading) {
    return (
      <div className="pt-32">
        <Container>
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="mt-6 h-80 w-full" />
        </Container>
      </div>
    );
  }
  if (!country) return null;

  const name = localized(country, 'name');
  const sections = [
    { icon: Plane, label: 'Immigration options', html: localized(country, 'immigration') },
    { icon: GraduationCap, label: 'Study opportunities', html: localized(country, 'study') },
    { icon: Wallet, label: 'Living costs', html: localized(country, 'living_costs') },
    { icon: FileCheck, label: 'Visa requirements', html: localized(country, 'visa_requirements') },
    { icon: Clock, label: 'Processing times', html: localized(country, 'processing_times') },
  ].filter((s) => s.html);

  const stories = (testimonials ?? []).filter(
    (t) => t.country && country.name_en && t.country.toLowerCase() === country.name_en.toLowerCase(),
  );

  return (
    <>
      <Seo
        title={name}
        description={localized(country, 'summary')}
        image={country.hero_image_url ?? undefined}
      />
      <PageHero
        eyebrow="Destination"
        title={`${country.flag_emoji ? country.flag_emoji + ' ' : ''}${name}`}
        intro={localized(country, 'summary')}
        image={country.hero_image_url}
      />

      <Section>
        <Container className="max-w-4xl">
          {localized(country, 'overview') && <RichText html={localized(country, 'overview')} />}

          <div className="mt-4 space-y-10">
            {sections.map((s) => (
              <div key={s.label}>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-btn bg-ala-red/10 text-ala-red">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h2 className="font-heading text-xl font-semibold text-ala-navy">{s.label}</h2>
                </div>
                <div className="mt-3 sm:pl-[3.25rem]">
                  <RichText html={s.html} />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {country.faqs && country.faqs.length > 0 && (
        <Section tone="grey">
          <Container className="max-w-3xl">
            <SectionHeading eyebrow="FAQ" title={`${name} — Frequently asked questions`} />
            <div className="mt-8">
              <Accordion
                items={country.faqs.map((f, i) => ({
                  id: String(i),
                  question: localized(f, 'question'),
                  answer: localized(f, 'answer'),
                }))}
              />
            </div>
          </Container>
        </Section>
      )}

      {stories.length > 0 && (
        <Section>
          <Container>
            <SectionHeading align="center" eyebrow="Success stories" title={`People we've helped reach ${name}`} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <LeadCTA
        title={`Ready to make ${name} your destination?`}
        subtitle="Start your application with ALA today."
        applyLabel={`Apply for ${name}`}
      />
    </>
  );
}
