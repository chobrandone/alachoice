import { useMemo, useState } from 'react';
import { Seo } from '@/components/Seo';
import { Container, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHero } from '@/components/content/PageHero';
import { NewsCard } from '@/components/content/NewsCard';
import { LeadCTA } from '@/components/content/LeadCTA';
import { useNews } from '@/lib/queries';
import { NEWS_CATEGORY_LABELS, type NewsCategory } from '@ala/types';
import { cn } from '@/lib/cn';

export default function News() {
  const { data: news, isLoading } = useNews();
  const [category, setCategory] = useState<string>('all');

  // Only show category pills that actually have articles.
  const categories = useMemo(() => {
    const present = new Set((news ?? []).map((n) => n.category));
    return (Object.keys(NEWS_CATEGORY_LABELS) as NewsCategory[]).filter((c) => present.has(c));
  }, [news]);

  const filtered = (news ?? []).filter((n) => category === 'all' || n.category === category);

  return (
    <>
      <Seo title="News & Updates" description="Immigration news, visa updates, scholarship opportunities, and announcements from ALA." />
      <PageHero
        eyebrow="News & Updates"
        title="The latest on immigration, study & opportunity"
        intro="Visa changes, scholarship intakes, and announcements — curated by the ALA team."
      />
      <Section tone="grey">
        <Container>
          {/* Category filter */}
          {categories.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
              {['all', ...categories].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    category === c
                      ? 'bg-ala-navy text-white'
                      : 'bg-white text-ala-grey-500 hover:text-ala-navy',
                  )}
                >
                  {c === 'all' ? 'All' : NEWS_CATEGORY_LABELS[c as NewsCategory]}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-card" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-ala-grey-500">No articles yet — check back soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((n, i) => (
                <Reveal key={n.id} delay={i * 0.05}>
                  <NewsCard article={n} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </Section>
      <LeadCTA />
    </>
  );
}
