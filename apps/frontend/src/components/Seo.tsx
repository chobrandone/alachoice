import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = 'American Liaison in Africa';
const DEFAULT_OG_IMAGE =
  'https://bihhaxezlkgusionmlwm.supabase.co/storage/v1/object/public/media/alachoice/2025/04/ala-Logo.jpg';

export function Seo({ title, description, image, type = 'website', jsonLd }: SeoProps) {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const isFr = i18n.language.startsWith('fr');
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const ogImage = image || DEFAULT_OG_IMAGE;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const canonical = `${origin}${pathname}`;

  return (
    <Helmet htmlAttributes={{ lang: isFr ? 'fr' : 'en' }}>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={isFr ? 'fr_FR' : 'en_US'} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
