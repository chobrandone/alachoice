import { useMemo, useState } from 'react';
import { Seo } from '@/components/Seo';
import { Container, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHero } from '@/components/content/PageHero';
import { TestimonialCard } from '@/components/content/TestimonialCard';
import { LeadCTA } from '@/components/content/LeadCTA';
import { useTestimonials, useServices } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';
import { cn } from '@/lib/cn';

const selectCls =
  'h-10 rounded-input border border-ala-grey-200 bg-white px-3 text-sm text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

export default function Testimonials() {
  const localized = useLocalized();
  const { data: testimonials, isLoading } = useTestimonials();
  const { data: services } = useServices();
  const [country, setCountry] = useState('all');
  const [serviceId, setServiceId] = useState('all');

  const countries = useMemo(
    () => [...new Set((testimonials ?? []).map((t) => t.country).filter(Boolean))] as string[],
    [testimonials],
  );

  const filtered = (testimonials ?? []).filter(
    (t) =>
      (country === 'all' || t.country === country) &&
      (serviceId === 'all' || t.service_id === serviceId),
  );

  return (
    <>
      <Seo title="Testimonials" description="Success stories from ALA clients across immigration, study abroad, and business." />
      <PageHero
        eyebrow="Success stories"
        title="Real people, real outcomes"
        intro="Hear from the clients we've helped bridge continents and unlock new opportunities."
      />
      <Section tone="grey">
        <Container>
          {/* Filters */}
          <div className="mb-10 flex flex-wrap gap-3">
            <select className={selectCls} value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="all">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className={cn(selectCls, 'max-w-xs')} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              <option value="all">All services</option>
              {(services ?? []).map((s) => (
                <option key={s.id} value={s.id}>{localized(s, 'title')}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-card" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-ala-grey-500">No testimonials match your filters yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.05}>
                  <TestimonialCard testimonial={t} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </Section>
      <LeadCTA
        title="Become our next success story"
        subtitle="Join thousands who've trusted ALA with their journey."
        applyLabel="Start Your Journey"
      />
    </>
  );
}
