import { z } from 'zod';
import {
  timestamped,
  baseRow,
  uuid,
  url,
  slug,
  isoDate,
  eventStatus,
  eventFieldType,
  registrationStatus,
  registrationSection,
  langRequired,
  langOptional,
} from './common.js';

/* ============================================================================
 * SITE SETTINGS
 * ==========================================================================*/
export const siteSetting = z.object({
  id: uuid,
  key: z.string().min(1).max(120),
  value_json: z.record(z.string(), z.unknown()).default({}),
  updated_at: isoDate,
});
export const siteSettingInput = siteSetting.pick({ key: true, value_json: true });
export type SiteSetting = z.infer<typeof siteSetting>;
export type SiteSettingInput = z.infer<typeof siteSettingInput>;

/* ============================================================================
 * HERO SLIDES
 * ==========================================================================*/
export const heroSlide = timestamped.extend({
  title_en: langRequired(200),
  title_fr: langOptional(200),
  eyebrow_en: langOptional(120),
  eyebrow_fr: langOptional(120),
  subtitle_en: langOptional(600),
  subtitle_fr: langOptional(600),
  image_url: url.nullish(),
  cta_primary_label: z.string().max(60).nullish(),
  cta_primary_url: z.string().max(2048).nullish(),
  cta_secondary_label: z.string().max(60).nullish(),
  cta_secondary_url: z.string().max(2048).nullish(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
});
export const heroSlideInput = heroSlide.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const heroSlideUpdate = heroSlideInput.partial();
export type HeroSlide = z.infer<typeof heroSlide>;
export type HeroSlideInput = z.infer<typeof heroSlideInput>;

/* ============================================================================
 * PAGES
 * ==========================================================================*/
export const page = timestamped.extend({
  slug,
  title_en: langRequired(200),
  title_fr: langOptional(200),
  body_en: langOptional(),
  body_fr: langOptional(),
  hero_image_url: url.nullish(),
  seo_title: z.string().max(200).nullish(),
  seo_description: z.string().max(320).nullish(),
  is_published: z.boolean().default(true),
});
export const pageInput = page.omit({ id: true, created_at: true, updated_at: true });
export const pageUpdate = pageInput.partial();
export type Page = z.infer<typeof page>;
export type PageInput = z.infer<typeof pageInput>;

/* ============================================================================
 * SERVICES
 * ==========================================================================*/
export const service = timestamped.extend({
  slug,
  title_en: langRequired(160),
  title_fr: langOptional(160),
  excerpt_en: langOptional(600),
  excerpt_fr: langOptional(600),
  body_en: langOptional(),
  body_fr: langOptional(),
  icon_name: z.string().max(60).nullish(),
  cover_image_url: url.nullish(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
});
export const serviceInput = service.omit({ id: true, created_at: true, updated_at: true });
export const serviceUpdate = serviceInput.partial();
export type Service = z.infer<typeof service>;
export type ServiceInput = z.infer<typeof serviceInput>;

/* ============================================================================
 * METHODOLOGY PILLARS
 * ==========================================================================*/
export const methodologyPillar = timestamped.extend({
  title_en: langRequired(160),
  title_fr: langOptional(160),
  description_en: langOptional(1000),
  description_fr: langOptional(1000),
  sort_order: z.number().int().default(0),
});
export const methodologyPillarInput = methodologyPillar.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const methodologyPillarUpdate = methodologyPillarInput.partial();
export type MethodologyPillar = z.infer<typeof methodologyPillar>;
export type MethodologyPillarInput = z.infer<typeof methodologyPillarInput>;

/* ============================================================================
 * STATISTICS
 * ==========================================================================*/
export const statistic = timestamped.extend({
  label_en: langRequired(120),
  label_fr: langOptional(120),
  value: z.number(),
  suffix: z.string().max(8).nullish(),
  sort_order: z.number().int().default(0),
});
export const statisticInput = statistic.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const statisticUpdate = statisticInput.partial();
export type Statistic = z.infer<typeof statistic>;
export type StatisticInput = z.infer<typeof statisticInput>;

/* ============================================================================
 * PARTNERS
 * ==========================================================================*/
export const partner = timestamped.extend({
  name: z.string().min(1).max(160),
  logo_url: url.nullish(),
  website_url: url.nullish(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
});
export const partnerInput = partner.omit({ id: true, created_at: true, updated_at: true });
export const partnerUpdate = partnerInput.partial();
export type Partner = z.infer<typeof partner>;
export type PartnerInput = z.infer<typeof partnerInput>;

/* ============================================================================
 * TEAM MEMBERS
 * ==========================================================================*/
export const teamMember = timestamped.extend({
  full_name: z.string().min(1).max(160),
  role_en: langOptional(160),
  role_fr: langOptional(160),
  bio_en: langOptional(4000),
  bio_fr: langOptional(4000),
  photo_url: url.nullish(),
  linkedin_url: url.nullish(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
});
export const teamMemberInput = teamMember.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const teamMemberUpdate = teamMemberInput.partial();
export type TeamMember = z.infer<typeof teamMember>;
export type TeamMemberInput = z.infer<typeof teamMemberInput>;

/* ============================================================================
 * TIMELINE ENTRIES
 * ==========================================================================*/
export const timelineEntry = timestamped.extend({
  year: z.string().min(1).max(16),
  title_en: langRequired(200),
  title_fr: langOptional(200),
  description_en: langOptional(2000),
  description_fr: langOptional(2000),
  sort_order: z.number().int().default(0),
});
export const timelineEntryInput = timelineEntry.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const timelineEntryUpdate = timelineEntryInput.partial();
export type TimelineEntry = z.infer<typeof timelineEntry>;
export type TimelineEntryInput = z.infer<typeof timelineEntryInput>;

/* ============================================================================
 * EVENTS + GALLERY
 * ==========================================================================*/
export const eventGalleryItem = baseRow.extend({
  event_id: uuid,
  image_url: url,
  caption: z.string().max(300).nullish(),
  sort_order: z.number().int().default(0),
});
export const eventGalleryItemInput = eventGalleryItem.omit({
  id: true,
  created_at: true,
});
export type EventGalleryItem = z.infer<typeof eventGalleryItem>;
export type EventGalleryItemInput = z.infer<typeof eventGalleryItemInput>;

/** A speaker entry stored in events.speakers (jsonb array). */
export const eventSpeaker = z.object({
  name: z.string().min(1).max(160),
  title: z.string().max(200).nullish(),
  photo_url: url.nullish(),
});
export type EventSpeaker = z.infer<typeof eventSpeaker>;

export const event = timestamped.extend({
  slug,
  title_en: langRequired(200),
  title_fr: langOptional(200),
  description_en: langOptional(600),
  description_fr: langOptional(600),
  body_en: langOptional(),
  body_fr: langOptional(),
  poster_url: url.nullish(),
  start_date: isoDate.nullish(),
  end_date: isoDate.nullish(),
  location: z.string().max(240).nullish(),
  registration_url: z.string().max(2048).nullish(),
  status: eventStatus.default('upcoming'),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
  // Rich event-page + registration metadata (migration 0003)
  event_time: z.string().max(120).nullish(),
  venue_name: z.string().max(240).nullish(),
  venue_address: z.string().max(400).nullish(),
  google_maps_url: z.string().max(2048).nullish(),
  organizer: z.string().max(200).nullish(),
  agenda_en: langOptional(),
  agenda_fr: langOptional(),
  speakers: z.array(eventSpeaker).default([]),
  registration_deadline: isoDate.nullish(),
  capacity: z.number().int().min(0).nullish(),
  registration_enabled: z.boolean().default(true),
  video_urls: z.string().nullish(), // newline-separated YouTube URLs (past-event videos)
});
export const eventInput = event.omit({ id: true, created_at: true, updated_at: true });
export const eventUpdate = eventInput.partial();
export type EventRow = z.infer<typeof event>;
export type EventInput = z.infer<typeof eventInput>;

/* ============================================================================
 * EVENT REGISTRATION — no-code form builder + attendee submissions
 * ==========================================================================*/

/** One selectable option for select / radio / checkbox fields. */
export const eventFieldOption = z.object({
  value: z.string().min(1).max(160),
  label_en: z.string().min(1).max(200),
  label_fr: z.string().max(200).nullish(),
});
export type EventFieldOption = z.infer<typeof eventFieldOption>;

/** A single field the admin added to an event's registration form. */
export const eventFormField = timestamped.extend({
  event_id: uuid,
  section: registrationSection.default('custom'),
  field_key: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9_]+$/, 'lowercase letters, numbers, and underscores only'),
  label_en: z.string().min(1).max(200),
  label_fr: z.string().max(200).nullish(),
  field_type: eventFieldType.default('text'),
  options: z.array(eventFieldOption).default([]),
  placeholder: z.string().max(200).nullish(),
  help_text: z.string().max(400).nullish(),
  is_required: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});
export const eventFormFieldInput = eventFormField.omit({
  id: true,
  event_id: true,
  created_at: true,
  updated_at: true,
});
export const eventFormFieldUpdate = eventFormFieldInput.partial();
export type EventFormField = z.infer<typeof eventFormField>;
export type EventFormFieldInput = z.infer<typeof eventFormFieldInput>;
export type EventFormFieldUpdate = z.infer<typeof eventFormFieldUpdate>;

/** An attendee registration row. */
export const eventRegistration = timestamped.extend({
  event_id: uuid,
  registration_ref: z.string().max(40),
  status: registrationStatus.default('pending'),
  full_name: z.string().min(1).max(200),
  email: z.string().email().max(240),
  phone: z.string().max(40).nullish(),
  country: z.string().max(120).nullish(),
  data: z.record(z.string(), z.unknown()).default({}),
  notes: z.string().max(5000).nullish(),
});
export type EventRegistration = z.infer<typeof eventRegistration>;

/** Public registration payload. Core fields + a `data` bag of custom answers. */
export const eventRegistrationInput = z.object({
  full_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(240),
  phone: z.string().trim().max(40).optional(),
  country: z.string().trim().max(120).optional(),
  data: z.record(z.string(), z.unknown()).default({}),
  company: z.string().max(0).optional(), // honeypot
});
export type EventRegistrationInput = z.infer<typeof eventRegistrationInput>;

/** Admin-editable fields on an existing registration. */
export const eventRegistrationUpdate = z.object({
  status: registrationStatus.optional(),
  notes: z.string().max(5000).nullish().optional(),
});
export type EventRegistrationUpdate = z.infer<typeof eventRegistrationUpdate>;

/** Event with its gallery attached (detail responses). */
export const eventWithGallery = event.extend({
  gallery: z.array(eventGalleryItem).default([]),
});
export type EventWithGallery = z.infer<typeof eventWithGallery>;

/** Public registration-form payload: the event's registration meta + fields. */
export const eventRegistrationForm = z.object({
  event: z.object({
    id: uuid,
    slug,
    title_en: z.string(),
    title_fr: z.string().nullish(),
    registration_enabled: z.boolean(),
    registration_deadline: isoDate.nullish(),
    capacity: z.number().int().nullish(),
    seats_taken: z.number().int(),
    seats_remaining: z.number().int().nullish(),
    is_full: z.boolean(),
    is_closed: z.boolean(),
  }),
  fields: z.array(eventFormField),
});
export type EventRegistrationForm = z.infer<typeof eventRegistrationForm>;

/* ============================================================================
 * FAQ
 * ==========================================================================*/
export const faq = timestamped.extend({
  question_en: langRequired(300),
  question_fr: langOptional(300),
  answer_en: langOptional(4000),
  answer_fr: langOptional(4000),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
});
export const faqInput = faq.omit({ id: true, created_at: true, updated_at: true });
export const faqUpdate = faqInput.partial();
export type Faq = z.infer<typeof faq>;
export type FaqInput = z.infer<typeof faqInput>;
