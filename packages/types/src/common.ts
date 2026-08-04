import { z } from 'zod';

// -----------------------------------------------------------------------------
// Enums (mirror the Postgres enums in supabase/migrations/0001_schema.sql)
// -----------------------------------------------------------------------------
export const adminRole = z.enum(['super_admin', 'editor']);
export type AdminRole = z.infer<typeof adminRole>;

export const eventStatus = z.enum(['upcoming', 'past']);
export type EventStatus = z.infer<typeof eventStatus>;

export const submissionStatus = z.enum(['new', 'read', 'replied', 'archived']);
export type SubmissionStatus = z.infer<typeof submissionStatus>;

export const registrationStatus = z.enum([
  'pending',
  'confirmed',
  'waitlisted',
  'attended',
  'cancelled',
]);
export type RegistrationStatus = z.infer<typeof registrationStatus>;

export const eventFieldType = z.enum([
  'text',
  'textarea',
  'email',
  'tel',
  'number',
  'date',
  'select',
  'radio',
  'checkbox',
  'file',
]);
export type EventFieldType = z.infer<typeof eventFieldType>;

export const registrationSection = z.enum([
  'personal',
  'professional',
  'educational',
  'custom',
]);
export type RegistrationSection = z.infer<typeof registrationSection>;

// -----------------------------------------------------------------------------
// Reusable field helpers
// -----------------------------------------------------------------------------
export const uuid = z.string().uuid();
export const isoDate = z.string().datetime({ offset: true });
export const url = z.string().url().max(2048);
export const optionalUrl = url.nullish();
export const slug = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a lowercase-hyphenated slug');

/** Columns present on every row, injected by the DB. */
export const baseRow = z.object({
  id: uuid,
  created_at: isoDate,
});

export const timestamped = baseRow.extend({
  updated_at: isoDate,
});

/** Standard API envelope: { success, data, error, meta }. */
export const apiEnvelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.boolean(),
    data: data.nullable(),
    error: z
      .object({ code: z.string(), message: z.string(), details: z.unknown().optional() })
      .nullable(),
    meta: z
      .object({
        page: z.number().int().optional(),
        pageSize: z.number().int().optional(),
        total: z.number().int().optional(),
      })
      .optional(),
  });

/** Pagination / search query params shared by admin list endpoints. */
export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  sort: z.string().max(64).optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});
export type ListQuery = z.infer<typeof listQuery>;

/** Reorder payload for drag-and-drop admin lists. */
export const reorderInput = z.object({
  items: z
    .array(z.object({ id: uuid, sort_order: z.number().int().min(0) }))
    .min(1),
});
export type ReorderInput = z.infer<typeof reorderInput>;

/** Bilingual text helpers — EN required, FR optional. */
export const langRequired = (max = 5000) => z.string().trim().min(1).max(max);
export const langOptional = (max = 20000) => z.string().trim().max(max).nullish();
