import { z } from 'zod';
import { timestamped, uuid, url, slug, isoDate, langRequired, langOptional } from './common.js';

/* ============================================================================
 * COUNTRIES — destination pages
 * ==========================================================================*/
export const countryFaq = z.object({
  question_en: z.string().min(1).max(300),
  question_fr: z.string().max(300).nullish(),
  answer_en: z.string().max(4000).nullish(),
  answer_fr: z.string().max(4000).nullish(),
});
export type CountryFaq = z.infer<typeof countryFaq>;

export const country = timestamped.extend({
  slug,
  name_en: langRequired(120),
  name_fr: langOptional(120),
  flag_emoji: z.string().max(16).nullish(),
  hero_image_url: url.nullish(),
  summary_en: langOptional(600),
  summary_fr: langOptional(600),
  overview_en: langOptional(),
  overview_fr: langOptional(),
  immigration_en: langOptional(),
  immigration_fr: langOptional(),
  study_en: langOptional(),
  study_fr: langOptional(),
  living_costs_en: langOptional(),
  living_costs_fr: langOptional(),
  visa_requirements_en: langOptional(),
  visa_requirements_fr: langOptional(),
  processing_times_en: langOptional(),
  processing_times_fr: langOptional(),
  faqs: z.array(countryFaq).default([]),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
});
export const countryInput = country.omit({ id: true, created_at: true, updated_at: true });
export const countryUpdate = countryInput.partial();
export type Country = z.infer<typeof country>;
export type CountryInput = z.infer<typeof countryInput>;

/* ============================================================================
 * NEWS ARTICLES — news center / blog
 * ==========================================================================*/
export const newsCategory = z.enum([
  'immigration_news',
  'visa_updates',
  'scholarships',
  'study_abroad',
  'business_immigration',
  'announcements',
  'event_news',
  'success_stories',
]);
export type NewsCategory = z.infer<typeof newsCategory>;

/** Human labels for the news categories (EN). */
export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  immigration_news: 'Immigration News',
  visa_updates: 'Visa Updates',
  scholarships: 'Scholarship Opportunities',
  study_abroad: 'Study Abroad',
  business_immigration: 'Business Immigration',
  announcements: 'ALA Announcements',
  event_news: 'Event News',
  success_stories: 'Success Stories',
};

export const newsArticle = timestamped.extend({
  slug,
  title_en: langRequired(240),
  title_fr: langOptional(240),
  summary_en: langOptional(600),
  summary_fr: langOptional(600),
  body_en: langOptional(),
  body_fr: langOptional(),
  cover_image_url: url.nullish(),
  category: newsCategory.default('announcements'),
  author: z.string().max(160).nullish(),
  published_at: isoDate.nullish(),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
});
export const newsArticleInput = newsArticle.omit({ id: true, created_at: true, updated_at: true });
export const newsArticleUpdate = newsArticleInput.partial();
export type NewsArticle = z.infer<typeof newsArticle>;
export type NewsArticleInput = z.infer<typeof newsArticleInput>;

/* ============================================================================
 * TESTIMONIALS
 * ==========================================================================*/
export const testimonial = timestamped.extend({
  author_name: z.string().min(1).max(160),
  author_role_en: langOptional(200),
  author_role_fr: langOptional(200),
  country: z.string().max(120).nullish(),
  service_id: uuid.nullish(),
  quote_en: langRequired(2000),
  quote_fr: langOptional(2000),
  photo_url: url.nullish(),
  video_url: z.string().max(2048).nullish(),
  rating: z.number().int().min(1).max(5).nullish(),
  sort_order: z.number().int().default(0),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
});
export const testimonialInput = testimonial.omit({ id: true, created_at: true, updated_at: true });
export const testimonialUpdate = testimonialInput.partial();
export type Testimonial = z.infer<typeof testimonial>;
export type TestimonialInput = z.infer<typeof testimonialInput>;
