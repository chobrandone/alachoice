import { usePartners } from '@/lib/queries';

/** Infinite greyscale→colour logo marquee. Duplicated track for a seamless loop. */
export function PartnerMarquee() {
  const { data: partners } = usePartners();
  const list = partners ?? [];
  if (!list.length) return null;

  const track = [...list, ...list];

  return (
    <div className="group relative overflow-hidden py-4" aria-label="Our partners">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-8 group-hover:[animation-play-state:paused]">
        {track.map((p, i) => {
          const logo = (
            <div className="flex h-24 w-44 items-center justify-center rounded-card border border-ala-grey-100 bg-white p-4 shadow-soft transition-transform duration-300 hover:scale-105">
              <img
                src={p.logo_url ?? ''}
                alt={p.name}
                loading="lazy"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          );
          return (
            <div key={`${p.id}-${i}`} className="shrink-0" aria-hidden={i >= list.length}>
              {p.website_url ? (
                <a href={p.website_url} target="_blank" rel="noopener noreferrer">
                  {logo}
                </a>
              ) : (
                logo
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
