-- =============================================================================
-- ALA — Digital signatures + automation reminder flags
-- Migration 0009
-- =============================================================================

-- Signature on applications
alter table applications
  add column if not exists signature_url text,
  add column if not exists signed_at     timestamptz,
  add column if not exists signed_name   text;

-- Reminder de-dupe flags
alter table appointments add column if not exists reminder_sent_at timestamptz;
alter table lead_tasks   add column if not exists reminder_sent_at timestamptz;
