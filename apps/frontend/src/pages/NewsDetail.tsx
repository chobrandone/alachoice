import { useParams, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, User, Linkedin, Facebook, Twitter } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Skeleton } from '@/components/ui/Skeleton';
import { RichText } from '@/components/ui/RichText';
import { PageHero } from '@/components/content/PageHero';
import { NewsCard } from '@/components/content/NewsCard';
import { LeadCTA } from '@/components/content/LeadCTA';
import { useNewsArticle, useNews } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';
import { formatDate } from '@/lib/format';
import { NEWS_CATEGORY_LABELS, type NewsCategory } from '@ala/types';
import { ApiError } from '@/lib/api';

export default function NewsDetail() {
  const { slug = '' } = useParams();
  const { i18n } = useTranslation();
  const localized = useLocalized();
  const { data: article, isLoading, error } = useNewsArticle(slug);
  const { data: all } = useNews();

  if (error instanceof ApiError && error.status === 404) return <Navigate to="/news" replace />;
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
  if (!article) return null;

  const title = localized(article, 'title');
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const related = (all ?? [])
    .filter((n) => n.id !== article.id && n.category === article.category)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    datePublished: article.published_at,
    author: article.author ? { '@type': 'Person', name: article.author } : undefined,
    image: article.cover_image_url ?? undefined,
  };

  return (
    <>
      <Seo
        title={title}
        description={localized(article, 'summary')}
        image={article.cover_image_url ?? undefined}
        type="article"
        jsonLd={jsonLd}
      />
      <PageHero
        eyebrow={NEWS_CATEGORY_LABELS[article.category as NewsCategory] ?? 'News'}
        title={title}
        image={article.cover_image_url}
      />
      <Section>
        <Container className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ala-grey-500">
            {article.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-ala-red" />
                {formatDate(article.published_at, i18n.language)}
              </span>
            )}
            {article.author && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-ala-red" /> {article.author}
              </span>
            )}
          </div>

          {article.cover_image_url && (
            <img
              src={article.cover_image_url}
              alt={title}
              className="mt-6 w-full rounded-card object-cover shadow-soft"
            />
          )}

          <div className="mt-8">
            <RichText html={localized(article, 'body')} />
          </div>

          {/* Social share */}
          <div className="mt-10 flex items-center gap-3 border-t border-ala-grey-200 pt-6">
            <span className="text-sm font-medium text-ala-navy">Share:</span>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
              className="rounded-full bg-ala-grey-50 p-2 text-ala-navy hover:bg-ala-navy hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
              className="rounded-full bg-ala-grey-50 p-2 text-ala-navy hover:bg-ala-navy hover:text-white"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X"
              className="rounded-full bg-ala-grey-50 p-2 text-ala-navy hover:bg-ala-navy hover:text-white"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section tone="grey">
          <Container>
            <SectionHeading eyebrow="Related" title="More on this topic" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((n) => (
                <NewsCard key={n.id} article={n} />
              ))}
            </div>
            <div className="mt-8">
              <Link to="/news" className="text-sm font-semibold text-ala-red hover:underline">
                ← Back to all news
              </Link>
            </div>
          </Container>
        </Section>
      )}

      <LeadCTA />
    </>
  );
}
