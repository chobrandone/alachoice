import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { useLocalized } from '@/lib/i18nField';
import { formatDate } from '@/lib/format';
import type { EventRow } from '@ala/types';

export function EventCard({ event }: { event: EventRow }) {
  const { t, i18n } = useTranslation();
  const localized = useLocalized();

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-ala-grey-200 bg-white shadow-soft transition-shadow hover:shadow-soft-lg">
      <Link to={`/events/${event.slug}`} className="block aspect-[16/10] overflow-hidden bg-ala-grey-50">
        {event.poster_url && (
          <img
            src={event.poster_url}
            alt={localized(event, 'title')}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap gap-4 text-xs font-medium text-ala-grey-500">
          {event.start_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-ala-red" />
              {formatDate(event.start_date, i18n.language)}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-ala-red" />
              {event.location}
            </span>
          )}
        </div>
        <h3 className="mt-3 font-heading text-lg font-semibold text-ala-navy">
          <Link to={`/events/${event.slug}`} className="hover:text-ala-navy-soft">
            {localized(event, 'title')}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-ala-grey-500 line-clamp-3">
          {localized(event, 'description')}
        </p>
        <div className="mt-5">
          {event.registration_url ? (
            <Button asChild size="sm">
              <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                {t('common.register')}
              </a>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline-navy">
              <Link to={`/events/${event.slug}`}>{t('common.readMore')}</Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
