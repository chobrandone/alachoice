import { z } from 'zod';
import { baseRow, timestamped, uuid, adminRole, url, isoDate } from './common.js';

/* ============================================================================
 * ADMIN USERS
 * ==========================================================================*/
export const adminUser = timestamped.extend({
  auth_uid: uuid.nullish(),
  full_name: z.string().min(1).max(160),
  email: z.string().email().max(240),
  role: adminRole.default('editor'),
  is_active: z.boolean().default(true),
});
/** Creating an admin also provisions a Supabase auth user server-side. */
export const adminUserInput = z.object({
  full_name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(240),
  password: z.string().min(8).max(128),
  role: adminRole.default('editor'),
  is_active: z.boolean().default(true),
});
export const adminUserUpdate = z.object({
  full_name: z.string().trim().min(1).max(160).optional(),
  role: adminRole.optional(),
  is_active: z.boolean().optional(),
});
export type AdminUser = z.infer<typeof adminUser>;
export type AdminUserInput = z.infer<typeof adminUserInput>;

/* ============================================================================
 * MEDIA
 * ==========================================================================*/
export const mediaBucket = z.enum(['media', 'logos', 'events', 'documents']);
export type MediaBucket = z.infer<typeof mediaBucket>;

export const media = baseRow.extend({
  file_url: url,
  file_name: z.string().min(1).max(300),
  mime_type: z.string().max(120).nullish(),
  size_bytes: z.number().int().nonnegative().nullish(),
  bucket: mediaBucket,
  alt_text: z.string().max(400).nullish(),
  uploaded_by: uuid.nullish(),
});
export const mediaUpdate = z.object({ alt_text: z.string().max(400).nullish() });
export type Media = z.infer<typeof media>;

/* ============================================================================
 * AUDIT LOG (read-only)
 * ==========================================================================*/
export const auditLog = baseRow.extend({
  admin_user_id: uuid.nullish(),
  action: z.string().max(40),
  entity: z.string().max(80),
  entity_id: uuid.nullish(),
  diff_json: z.unknown().nullish(),
  ip: z.string().max(64).nullish(),
});
export type AuditLog = z.infer<typeof auditLog>;

/* ============================================================================
 * AUTH
 * ==========================================================================*/
export const loginInput = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(128),
});
export const sessionUser = z.object({
  id: uuid,
  auth_uid: uuid.nullish(),
  full_name: z.string(),
  email: z.string().email(),
  role: adminRole,
  is_active: z.boolean(),
});
export type LoginInput = z.infer<typeof loginInput>;
export type SessionUser = z.infer<typeof sessionUser>;
export { isoDate };
