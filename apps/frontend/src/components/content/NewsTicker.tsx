import { Link } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import { useNews } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';

/** Homepage news ticker — a looping strip of the latest headlines below the nav. */
export function NewsTicker() {
  const localized = useLocalized();
  const { data: news } = useNews();
  const list = (news ?? []).slice(0, 8);
  if (list.length === 0) return null;

  const track = [...list, ...list];

  return (
    <div className="flex items-stretch border-y border-ala-grey-200 bg-white">
      <div className="flex shrink-0 items-center gap-2 bg-ala-red px-4 text-xs font-bold uppercase tracking-wider text-white">
        <Megaphone className="h-4 w-4" />
        <span className="hidden sm:inline">Latest</span>
      </div>
      <div className="group relative flex-1 overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-10 py-2.5 group-hover:[animation-play-state:paused]">
          {track.map((n, i) => (
            <Link
              key={`${n.id}-${i}`}
              to={`/news/${n.slug}`}
              aria-hidden={i >= list.length}
              className="flex shrink-0 items-center gap-2 text-sm text-ala-navy hover:text-ala-red"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-ala-gold" />
              {localized(n, 'title')}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
