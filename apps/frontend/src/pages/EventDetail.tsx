import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, Building2, User, CalendarClock, ExternalLink } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { RichText } from '@/components/ui/RichText';
import { PageHero } from '@/components/content/PageHero';
import { EventRegistrationForm } from '@/components/forms/EventRegistrationForm';
import { useEvent } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';
import { formatDate } from '@/lib/format';
import { parseVideoUrls } from '@/lib/youtube';
import { ApiError } from '@/lib/api';

export default function EventDetail() {
  const { slug = '' } = useParams();
  const { t, i18n } = useTranslation();
  const localized = useLocalized();
  const { data: event, isLoading, error } = useEvent(slug);

  if (error instanceof ApiError && error.status === 404) return <Navigate to="/events" replace />;
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
  if (!event) return null;

  const agenda = localized(event, 'agenda');
  const speakers = event.speakers ?? [];
  const videoIds = parseVideoUrls(event.video_urls);
  const registrationOpen = event.registration_enabled !== false && event.status !== 'past';

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: localized(event, 'title'),
    startDate: event.start_date,
    endDate: event.end_date,
    location:
      event.venue_name || event.location
        ? {
            '@type': 'Place',
            name: event.venue_name ?? event.location,
            address: event.venue_address ?? undefined,
          }
        : undefined,
    organizer: event.organizer ? { '@type': 'Organization', name: event.organizer } : undefined,
  };

  return (
    <>
      <Seo
        title={localized(event, 'title')}
        description={localized(event, 'description')}
        image={event.poster_url ?? undefined}
        type="article"
        jsonLd={eventJsonLd}
      />
      <PageHero eyebrow={t('nav.events')} title={localized(event, 'title')} image={event.poster_url} />
      <Section>
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {event.poster_url && (
              <img
                src={event.poster_url}
                alt={localized(event, 'title')}
                className="mb-8 w-full rounded-card object-cover shadow-soft"
              />
            )}
            <RichText html={localized(event, 'body')} />

            {/* Agenda */}
            {agenda && (
              <div className="mt-10">
                <h2 className="text-h3 font-heading font-semibold text-ala-navy">Agenda</h2>
                <div className="mt-4">
                  <RichText html={agenda} />
                </div>
              </div>
            )}

            {/* Speakers */}
            {speakers.length > 0 && (
              <div className="mt-10">
                <h2 className="text-h3 font-heading font-semibold text-ala-navy">Speakers</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {speakers.map((sp, i) => (
                    <div key={i} className="flex items-center gap-4">
                      {sp.photo_url ? (
                        <img
                          src={sp.photo_url}
                          alt={sp.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ala-navy/10 text-ala-navy">
                          <User className="h-7 w-7" />
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-ala-navy">{sp.name}</p>
                        {sp.title && <p className="text-sm text-ala-grey-500">{sp.title}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery (past events) */}
            {event.gallery && event.gallery.length > 0 && (
              <div className="mt-10">
                <h2 className="text-h3 font-heading font-semibold text-ala-navy">Photo gallery</h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {event.gallery.map((g) => (
                    <img
                      key={g.id}
                      src={g.image_url}
                      alt={g.caption ?? ''}
                      loading="lazy"
                      className="aspect-square w-full rounded-card object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Videos (YouTube) */}
            {videoIds.length > 0 && (
              <div className="mt-10">
                <h2 className="text-h3 font-heading font-semibold text-ala-navy">Videos</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {videoIds.map((id) => (
                    <div key={id} className="aspect-video overflow-hidden rounded-card bg-black shadow-soft">
                      <iframe
                        src={`https://www.youtube.com/embed/${id}`}
                        title="Event video"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: details + register CTA */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-card border border-ala-grey-200 bg-ala-grey-50 p-6">
              <dl className="space-y-4 text-sm">
                {event.start_date && (
                  <DetailRow icon={Calendar} label="Date">
                    {formatDate(event.start_date, i18n.language)}
                    {event.end_date &&
                      event.end_date.slice(0, 10) !== event.start_date.slice(0, 10) &&
                      ` – ${formatDate(event.end_date, i18n.language)}`}
                  </DetailRow>
                )}
                {event.event_time && (
                  <DetailRow icon={Clock} label="Time">
                    {event.event_time}
                  </DetailRow>
                )}
                {(event.venue_name || event.location) && (
                  <DetailRow icon={MapPin} label="Venue">
                    <span className="block">{event.venue_name ?? event.location}</span>
                    {event.venue_address && (
                      <span className="block text-ala-grey-500">{event.venue_address}</span>
                    )}
                    {event.google_maps_url && (
                      <a
                        href={event.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-ala-red hover:underline"
                      >
                        View on map <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </DetailRow>
                )}
                {event.organizer && (
                  <DetailRow icon={Building2} label="Organizer">
                    {event.organizer}
                  </DetailRow>
                )}
                {event.registration_deadline && (
                  <DetailRow icon={CalendarClock} label="Registration deadline">
                    {formatDate(event.registration_deadline, i18n.language)}
                  </DetailRow>
                )}
              </dl>

              {registrationOpen ? (
                <Button asChild className="mt-6 w-full">
                  <a href="#register">{t('common.register')}</a>
                </Button>
              ) : event.registration_url ? (
                <Button asChild className="mt-6 w-full">
                  <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                    {t('common.register')}
                  </a>
                </Button>
              ) : null}
            </div>
          </aside>
        </Container>
      </Section>

      {/* Registration form */}
      {registrationOpen && (
        <Section tone="grey" id="register">
          <Container className="max-w-2xl">
            <SectionHeading
              align="center"
              eyebrow="Registration"
              title={`Register for ${localized(event, 'title')}`}
            />
            <div className="mt-8">
              <EventRegistrationForm slug={slug} />
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Calendar;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ala-red" />
      <div>
        <dt className="font-semibold text-ala-navy">{label}</dt>
        <dd className="text-ala-grey-500">{children}</dd>
      </div>
    </div>
  );
}
