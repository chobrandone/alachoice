import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NEWS_CATEGORY_LABELS, type NewsArticle, type NewsCategory } from '@ala/types';
import { useLocalized } from '@/lib/i18nField';
import { formatDate } from '@/lib/format';

export function NewsCard({ article }: { article: NewsArticle }) {
  const { i18n } = useTranslation();
  const localized = useLocalized();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-ala-grey-200 bg-white shadow-soft transition-shadow hover:shadow-soft-lg">
      <Link to={`/news/${article.slug}`} className="block aspect-[16/9] overflow-hidden bg-ala-grey-100">
        {article.cover_image_url && (
          <img
            src={article.cover_image_url}
            alt={localized(article, 'title')}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
          <span className="rounded-full bg-ala-red/10 px-2.5 py-0.5 text-ala-red">
            {NEWS_CATEGORY_LABELS[article.category as NewsCategory] ?? article.category}
          </span>
          {article.published_at && (
            <span className="text-ala-grey-500">{formatDate(article.published_at, i18n.language)}</span>
          )}
        </div>
        <h3 className="mt-3 font-heading text-lg font-semibold text-ala-navy">
          <Link to={`/news/${article.slug}`} className="hover:text-ala-navy-soft">
            {localized(article, 'title')}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-ala-grey-500 line-clamp-3">
          {localized(article, 'summary')}
        </p>
        {article.author && <p className="mt-4 text-xs text-ala-grey-500">By {article.author}</p>}
      </div>
    </article>
  );
}
