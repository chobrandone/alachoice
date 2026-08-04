import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Container, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHero } from '@/components/content/PageHero';
import { LeadCTA } from '@/components/content/LeadCTA';
import { useCountries } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';

export default function Countries() {
  const localized = useLocalized();
  const { data: countries, isLoading } = useCountries();

  return (
    <>
      <Seo title="Countries" description="Immigration, study, and business destinations ALA supports — visa options, requirements, costs, and processing times." />
      <PageHero
        eyebrow="Destinations"
        title="Your gateway to the world"
        intro="Explore immigration, study, and business opportunities across our supported destinations."
      />
      <Section tone="grey">
        <Container>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-card" />
              ))}
            </div>
          ) : (countries ?? []).length === 0 ? (
            <p className="py-16 text-center text-ala-grey-500">Destinations coming soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(countries ?? []).map((c, i) => (
                <Reveal key={c.id} delay={i * 0.05}>
                  <Link
                    to={`/countries/${c.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-card border border-ala-grey-200 bg-white shadow-soft transition-shadow hover:shadow-soft-lg"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-ala-grey-100">
                      {c.hero_image_url && (
                        <img
                          src={c.hero_image_url}
                          alt={localized(c, 'name')}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      {c.flag_emoji && (
                        <span className="absolute left-4 top-4 text-3xl drop-shadow">{c.flag_emoji}</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-heading text-xl font-semibold text-ala-navy">
                        {localized(c, 'name')}
                      </h3>
                      <p className="mt-2 flex-1 text-sm text-ala-grey-500 line-clamp-3">
                        {localized(c, 'summary')}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ala-red">
                        Explore {localized(c, 'name')}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </Section>
      <LeadCTA
        title="Not sure which destination is right for you?"
        subtitle="Get a personalized assessment from an ALA advisor."
        applyLabel="Request an Assessment"
      />
    </>
  );
}
