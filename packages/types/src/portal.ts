import { z } from 'zod';
import { timestamped, uuid, isoDate } from './common.js';

/* ============================================================================
 * ENUMS
 * ==========================================================================*/
export const applicationType = z.enum([
  'study_abroad',
  'immigration',
  'business',
  'consultation',
  'partnership',
]);
export type ApplicationType = z.infer<typeof applicationType>;

export const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
  study_abroad: 'Study Abroad',
  immigration: 'Immigration',
  business: 'Business & Investment',
  consultation: 'Consultation',
  partnership: 'Partnership',
};

export const applicationStatus = z.enum([
  'draft',
  'submitted',
  'in_review',
  'approved',
  'rejected',
  'completed',
]);
export type ApplicationStatus = z.infer<typeof applicationStatus>;

export const documentStatus = z.enum(['pending', 'approved', 'rejected']);
export type DocumentStatus = z.infer<typeof documentStatus>;

export const docType = z.enum([
  'passport',
  'cv',
  'transcript',
  'certificate',
  'photo',
  'bank_statement',
  'reference_letter',
  'other',
]);
export type DocType = z.infer<typeof docType>;

/* ============================================================================
 * CLIENT (portal user profile)
 * ==========================================================================*/
export const client = timestamped.extend({
  auth_uid: uuid.nullish(),
  full_name: z.string().min(1).max(160),
  email: z.string().email().max(240),
  phone: z.string().max(40).nullish(),
  country: z.string().max(120).nullish(),
});
export type Client = z.infer<typeof client>;

export const clientRegisterInput = z.object({
  full_name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(240),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(40).optional(),
  country: z.string().trim().max(120).optional(),
});
export type ClientRegisterInput = z.infer<typeof clientRegisterInput>;

export const clientLoginInput = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(128),
});
export type ClientLoginInput = z.infer<typeof clientLoginInput>;

export const clientProfileUpdate = z.object({
  full_name: z.string().trim().min(1).max(160).optional(),
  phone: z.string().trim().max(40).nullish().optional(),
  country: z.string().trim().max(120).nullish().optional(),
});
export type ClientProfileUpdate = z.infer<typeof clientProfileUpdate>;

export const sessionClient = z.object({
  id: uuid,
  auth_uid: uuid.nullish(),
  full_name: z.string(),
  email: z.string().email(),
  phone: z.string().nullish(),
  country: z.string().nullish(),
});
export type SessionClient = z.infer<typeof sessionClient>;

/* ============================================================================
 * APPLICATIONS
 * ==========================================================================*/
export const application = timestamped.extend({
  client_id: uuid,
  ref: z.string().max(40),
  type: applicationType,
  title: z.string().min(1).max(240),
  status: applicationStatus.default('draft'),
  data: z.record(z.string(), z.unknown()).default({}),
  progress: z.number().int().min(0).max(100).default(0),
  notes: z.string().max(5000).nullish(),
  submitted_at: isoDate.nullish(),
  signature_url: z.string().max(2048).nullish(),
  signed_at: isoDate.nullish(),
  signed_name: z.string().max(200).nullish(),
});
export type Application = z.infer<typeof application>;

/** Sign & submit payload: a base64 PNG data URL + the typed legal name. */
export const applicationSignInput = z.object({
  signature: z.string().min(30).max(900_000), // data:image/png;base64,... (< 1mb body limit)
  signed_name: z.string().trim().min(1).max(200),
});
export type ApplicationSignInput = z.infer<typeof applicationSignInput>;

export const applicationCreateInput = z.object({
  type: applicationType,
  title: z.string().trim().min(1).max(240),
  data: z.record(z.string(), z.unknown()).default({}),
  progress: z.number().int().min(0).max(100).default(0),
});
export type ApplicationCreateInput = z.infer<typeof applicationCreateInput>;

/** Client-side edits — including submitting (draft → submitted). */
export const applicationUpdateInput = z.object({
  title: z.string().trim().min(1).max(240).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  status: z.enum(['draft', 'submitted']).optional(),
});
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateInput>;

/** Admin-side review. */
export const applicationAdminUpdate = z.object({
  status: applicationStatus.optional(),
  notes: z.string().max(5000).nullish().optional(),
});
export type ApplicationAdminUpdate = z.infer<typeof applicationAdminUpdate>;

/* ============================================================================
 * CLIENT DOCUMENTS
 * ==========================================================================*/
export const clientDocument = timestamped.extend({
  client_id: uuid,
  application_id: uuid.nullish(),
  doc_type: docType.nullish(),
  file_url: z.string().max(2048),
  file_name: z.string().max(300),
  mime_type: z.string().max(120).nullish(),
  size_bytes: z.number().int().nonnegative().nullish(),
  status: documentStatus.default('pending'),
  notes: z.string().max(2000).nullish(),
});
export type ClientDocument = z.infer<typeof clientDocument>;

export const documentAdminUpdate = z.object({
  status: documentStatus.optional(),
  notes: z.string().max(2000).nullish().optional(),
});
export type DocumentAdminUpdate = z.infer<typeof documentAdminUpdate>;

/* ============================================================================
 * APPOINTMENTS
 * ==========================================================================*/
export const appointmentStatus = z.enum(['requested', 'confirmed', 'completed', 'cancelled']);
export type AppointmentStatus = z.infer<typeof appointmentStatus>;

export const appointmentMode = z.enum(['online', 'physical']);
export type AppointmentMode = z.infer<typeof appointmentMode>;

export const slotMode = z.enum(['online', 'physical', 'both']);
export type SlotMode = z.infer<typeof slotMode>;

/** Admin-managed bookable slot. */
export const availabilitySlot = timestamped.extend({
  consultant_id: uuid.nullish(),
  starts_at: isoDate,
  duration_minutes: z.number().int().min(5).max(480).default(30),
  mode: slotMode.default('both'),
  is_booked: z.boolean().default(false),
  is_active: z.boolean().default(true),
});
export const availabilitySlotInput = availabilitySlot.omit({
  id: true,
  created_at: true,
  updated_at: true,
  is_booked: true,
});
export const availabilitySlotUpdate = availabilitySlotInput.partial();
export type AvailabilitySlot = z.infer<typeof availabilitySlot>;
export type AvailabilitySlotInput = z.infer<typeof availabilitySlotInput>;

export const appointment = timestamped.extend({
  client_id: uuid,
  slot_id: uuid.nullish(),
  service_id: uuid.nullish(),
  consultant_id: uuid.nullish(),
  scheduled_at: isoDate,
  duration_minutes: z.number().int().default(30),
  mode: appointmentMode.default('online'),
  status: appointmentStatus.default('requested'),
  location: z.string().max(400).nullish(),
  meeting_link: z.string().max(2048).nullish(),
  notes: z.string().max(2000).nullish(),
});
export type Appointment = z.infer<typeof appointment>;

/** Client booking payload — server derives time/consultant from the slot. */
export const appointmentBookInput = z.object({
  slot_id: uuid,
  service_id: uuid.optional(),
  mode: appointmentMode.default('online'),
  notes: z.string().trim().max(2000).optional(),
});
export type AppointmentBookInput = z.infer<typeof appointmentBookInput>;

export const appointmentAdminUpdate = z.object({
  status: appointmentStatus.optional(),
  meeting_link: z.string().max(2048).nullish().optional(),
  location: z.string().max(400).nullish().optional(),
  notes: z.string().max(2000).nullish().optional(),
});
export type AppointmentAdminUpdate = z.infer<typeof appointmentAdminUpdate>;
