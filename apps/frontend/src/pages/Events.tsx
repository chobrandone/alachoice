import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Images } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHero } from '@/components/content/PageHero';
import { EventCard } from '@/components/content/EventCard';
import { useEvents } from '@/lib/queries';
import type { EventRow } from '@ala/types';

function EventGrid({
  events,
  isLoading,
  emptyLabel,
}: {
  events?: EventRow[];
  isLoading: boolean;
  emptyLabel: string;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-96 rounded-card" />
        ))}
      </div>
    );
  }
  if (!events || events.length === 0) {
    return <p className="py-10 text-ala-grey-500">{emptyLabel}</p>;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e, i) => (
        <Reveal key={e.id} delay={i * 0.06}>
          <EventCard event={e} />
        </Reveal>
      ))}
    </div>
  );
}

export default function Events() {
  const { t } = useTranslation();
  const { data: upcoming, isLoading: upLoading } = useEvents('upcoming');
  const { data: past, isLoading: pastLoading } = useEvents('past');

  return (
    <>
      <Seo title="Events" description="Upcoming and past events hosted by ALA." />
      <PageHero
        eyebrow="Events"
        title="Where opportunity meets connection"
        intro="Browse our upcoming and past events — and revisit the highlights in our photo gallery."
      />

      {/* Upcoming */}
      <Section>
        <Container>
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <SectionHeading eyebrow={t('common.upcoming')} title="Upcoming events" />
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-btn border border-ala-navy px-4 py-2 text-sm font-semibold text-ala-navy transition-colors hover:bg-ala-navy hover:text-white"
            >
              <Images className="h-4 w-4" /> {t('nav.gallery')}
            </Link>
          </div>
          <EventGrid
            events={upcoming as EventRow[] | undefined}
            isLoading={upLoading}
            emptyLabel="No upcoming events right now — check back soon."
          />
        </Container>
      </Section>

      {/* Past */}
      <Section tone="grey">
        <Container>
          <SectionHeading eyebrow={t('common.past')} title="Past events" className="mb-10" />
          <EventGrid
            events={past as EventRow[] | undefined}
            isLoading={pastLoading}
            emptyLabel="Past events and photos will appear here."
          />
        </Container>
      </Section>
    </>
  );
}
