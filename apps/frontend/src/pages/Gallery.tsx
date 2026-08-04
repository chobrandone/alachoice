import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Container, Section } from '@/components/ui/primitives';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHero } from '@/components/content/PageHero';
import { useGallery, type GalleryPhoto } from '@/lib/queries';

export default function Gallery() {
  const { data: photos, isLoading } = useGallery();
  const [active, setActive] = useState<GalleryPhoto | null>(null);

  return (
    <>
      <Seo title="Gallery" description="Photos from ALA events, summits, and seminars across Africa and the United States." />
      <PageHero eyebrow="Gallery" title="Moments from our events" intro="A look back at the summits, seminars, and delegations we've hosted." />
      <Section tone="grey">
        <Container>
          {isLoading ? (
            <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="mb-4 h-48 w-full rounded-card" />
              ))}
            </div>
          ) : (photos ?? []).length === 0 ? (
            <p className="py-16 text-center text-ala-grey-500">
              No photos yet — check back after our next event.{' '}
              <Link to="/events" className="font-medium text-ala-red hover:underline">See events</Link>
            </p>
          ) : (
            <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
              {(photos ?? []).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActive(p)}
                  className="group mb-4 block w-full overflow-hidden rounded-card"
                >
                  <img
                    src={p.image_url}
                    alt={p.caption ?? p.event_title ?? ''}
                    loading="lazy"
                    className="w-full rounded-card object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <button className="absolute right-5 top-5 text-white/80 hover:text-white" aria-label="Close" onClick={() => setActive(null)}>
            <X className="h-7 w-7" />
          </button>
          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={active.image_url} alt={active.caption ?? ''} className="max-h-[80vh] w-auto rounded-card" />
            <figcaption className="mt-3 text-center text-sm text-white/80">
              {active.caption}
              {active.event_slug && (
                <>
                  {active.caption ? ' · ' : ''}
                  <Link to={`/events/${active.event_slug}`} className="font-medium text-white underline">
                    {active.event_title}
                  </Link>
                </>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
