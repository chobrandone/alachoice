import { z } from 'zod';
import { timestamped, isoDate, langRequired, langOptional } from './common.js';

/* ============================================================================
 * ANNOUNCEMENTS — persistent top-of-site banner
 * ==========================================================================*/
export const announcementStyle = z.enum(['info', 'success', 'warning', 'promo']);
export type AnnouncementStyle = z.infer<typeof announcementStyle>;

export const announcement = timestamped.extend({
  message_en: langRequired(300),
  message_fr: langOptional(300),
  link_url: z.string().max(2048).nullish(),
  link_label_en: z.string().max(80).nullish(),
  link_label_fr: z.string().max(80).nullish(),
  style: announcementStyle.default('info'),
  dismissible: z.boolean().default(true),
  starts_at: isoDate.nullish(),
  ends_at: isoDate.nullish(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
});
export const announcementInput = announcement.omit({ id: true, created_at: true, updated_at: true });
export const announcementUpdate = announcementInput.partial();
export type Announcement = z.infer<typeof announcement>;
export type AnnouncementInput = z.infer<typeof announcementInput>;

/* ============================================================================
 * POPUPS — admin-managed modal popups
 * ==========================================================================*/
export const popupTrigger = z.enum(['load', 'delay', 'scroll', 'exit_intent']);
export type PopupTrigger = z.infer<typeof popupTrigger>;

export const popupFrequency = z.enum(['once', 'session', 'always']);
export type PopupFrequency = z.infer<typeof popupFrequency>;

export const popupAudience = z.enum(['all', 'first_time', 'returning']);
export type PopupAudience = z.infer<typeof popupAudience>;

export const popupDevice = z.enum(['all', 'mobile', 'desktop']);
export type PopupDevice = z.infer<typeof popupDevice>;

export const popup = timestamped.extend({
  name: z.string().min(1).max(160),
  title_en: langOptional(200),
  title_fr: langOptional(200),
  body_en: langOptional(2000),
  body_fr: langOptional(2000),
  image_url: z.string().max(2048).nullish(),
  cta_label_en: z.string().max(80).nullish(),
  cta_label_fr: z.string().max(80).nullish(),
  cta_url: z.string().max(2048).nullish(),
  trigger: popupTrigger.default('delay'),
  delay_seconds: z.number().int().min(0).max(600).default(5),
  scroll_percent: z.number().int().min(0).max(100).default(40),
  frequency: popupFrequency.default('session'),
  target_paths: z.string().max(1000).nullish(),
  audience: popupAudience.default('all'),
  device: popupDevice.default('all'),
  countdown_to: isoDate.nullish(),
  show_newsletter: z.boolean().default(false),
  starts_at: isoDate.nullish(),
  ends_at: isoDate.nullish(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
});
export const popupInput = popup.omit({ id: true, created_at: true, updated_at: true });
export const popupUpdate = popupInput.partial();
export type Popup = z.infer<typeof popup>;
export type PopupInput = z.infer<typeof popupInput>;
