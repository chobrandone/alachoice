import { Quote, Star, PlayCircle } from 'lucide-react';
import { useLocalized } from '@/lib/i18nField';
import type { Testimonial } from '@ala/types';

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const localized = useLocalized();
  const t = testimonial;

  return (
    <figure className="flex h-full flex-col rounded-card border border-ala-grey-200 bg-white p-6 shadow-soft">
      <Quote className="h-8 w-8 text-ala-red/30" aria-hidden />
      {t.rating != null && (
        <div className="mt-2 flex gap-0.5" aria-label={`${t.rating} out of 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={i < (t.rating ?? 0) ? 'h-4 w-4 fill-ala-gold text-ala-gold' : 'h-4 w-4 text-ala-grey-200'}
            />
          ))}
        </div>
      )}
      <blockquote className="mt-3 flex-1 text-ala-ink">{localized(t, 'quote')}</blockquote>

      {t.video_url && (
        <a
          href={t.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ala-red hover:underline"
        >
          <PlayCircle className="h-4 w-4" /> Watch video
        </a>
      )}

      <figcaption className="mt-5 flex items-center gap-3 border-t border-ala-grey-100 pt-4">
        {t.photo_url ? (
          <img src={t.photo_url} alt={t.author_name} className="h-11 w-11 rounded-full object-cover" />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ala-navy/10 font-heading font-bold text-ala-navy">
            {t.author_name.charAt(0)}
          </span>
        )}
        <div>
          <p className="font-semibold text-ala-navy">{t.author_name}</p>
          <p className="text-xs text-ala-grey-500">
            {localized(t, 'author_role')}
            {t.country ? ` · ${t.country}` : ''}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
