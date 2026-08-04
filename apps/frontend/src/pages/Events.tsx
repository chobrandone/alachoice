import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Images } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Container, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHero } from '@/components/content/PageHero';
import { EventCard } from '@/components/content/EventCard';
import { useEvents } from '@/lib/queries';
import { cn } from '@/lib/cn';

export default function Events() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data: events, isLoading } = useEvents(tab);

  return (
    <>
      <Seo title="Events" description="Upcoming and past events hosted by ALA." />
      <PageHero
        eyebrow="Events"
        title="Where opportunity meets connection"
        intro="Browse upcoming and past events — and revisit the highlights in our photo gallery."
      />
      <Section tone="grey">
        <Container>
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-btn border border-ala-grey-200 bg-white p-1" role="tablist">
            {(['upcoming', 'past'] as const).map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  'rounded-md px-6 py-2 text-sm font-semibold transition-colors',
                  tab === key ? 'bg-ala-navy text-white' : 'text-ala-grey-500 hover:text-ala-navy',
                )}
              >
                {t(`common.${key}`)}
              </button>
            ))}
          </div>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-btn border border-ala-navy px-4 py-2 text-sm font-semibold text-ala-navy transition-colors hover:bg-ala-navy hover:text-white"
            >
              <Images className="h-4 w-4" /> {t('nav.gallery')}
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-card" />
              ))}
            </div>
          ) : (events ?? []).length === 0 ? (
            <p className="py-16 text-center text-ala-grey-500">
              No {t(`common.${tab}`).toLowerCase()} events at the moment.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(events ?? []).map((e, i) => (
                <Reveal key={e.id} delay={i * 0.06}>
                  <EventCard event={e} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
