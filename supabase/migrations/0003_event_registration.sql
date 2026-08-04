-- =============================================================================
-- ALA — Dynamic Event Registration System
-- Migration 0003: rich event fields, no-code registration form builder,
--                 attendee registrations, RLS + indexes.
-- Postgres 17 / Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type registration_status as enum
    ('pending', 'confirmed', 'waitlisted', 'attended', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_field_type as enum
    ('text', 'textarea', 'email', 'tel', 'number', 'date', 'select', 'radio', 'checkbox', 'file');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- Extend events with the rich event-page + registration metadata
-- -----------------------------------------------------------------------------
alter table events
  add column if not exists event_time            text,          -- e.g. "09:00 – 17:00"
  add column if not exists venue_name            text,
  add column if not exists venue_address         text,
  add column if not exists google_maps_url       text,
  add column if not exists organizer             text,
  add column if not exists agenda_en             text,
  add column if not exists agenda_fr             text,
  add column if not exists speakers              jsonb not null default '[]'::jsonb,  -- [{name,title,photo_url}]
  add column if not exists registration_deadline timestamptz,
  add column if not exists capacity              int,           -- null = unlimited seats
  add column if not exists registration_enabled  boolean not null default true;

-- -----------------------------------------------------------------------------
-- event_form_fields — the no-code form builder. Each row is one field the admin
-- chose to show on an event's registration form.
-- -----------------------------------------------------------------------------
create table if not exists event_form_fields (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references events(id) on delete cascade,
  section      text not null default 'custom',   -- personal | professional | educational | custom
  field_key    text not null,                    -- machine key, unique per event (e.g. "occupation")
  label_en     text not null,
  label_fr     text,
  field_type   event_field_type not null default 'text',
  options      jsonb not null default '[]'::jsonb,  -- [{value,label_en,label_fr}] for select/radio/checkbox
  placeholder  text,
  help_text    text,
  is_required  boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (event_id, field_key)
);
create trigger trg_event_form_fields_updated before update on event_form_fields
  for each row execute function set_updated_at();
create index if not exists idx_event_form_fields_event
  on event_form_fields (event_id, sort_order);

-- -----------------------------------------------------------------------------
-- event_registrations — one attendee submission per row. Fixed core columns are
-- promoted for filtering/export; all custom-field answers live in `data` jsonb
-- keyed by field_key.
-- -----------------------------------------------------------------------------
create table if not exists event_registrations (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references events(id) on delete cascade,
  registration_ref text not null unique,         -- human-friendly, e.g. "ALA-7F3K9Q"
  status           registration_status not null default 'pending',
  full_name        text not null,
  email            text not null,
  phone            text,
  country          text,
  data             jsonb not null default '{}'::jsonb,  -- custom answers keyed by field_key
  notes            text,                          -- internal admin notes
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger trg_event_registrations_updated before update on event_registrations
  for each row execute function set_updated_at();
create index if not exists idx_event_reg_event   on event_registrations (event_id, created_at desc);
create index if not exists idx_event_reg_status  on event_registrations (status, created_at desc);
create index if not exists idx_event_reg_country on event_registrations (country);
create index if not exists idx_event_reg_email   on event_registrations (email);

-- =============================================================================
-- Row Level Security
--   * Public (anon) may read form fields only for published events (to render
--     the form) and INSERT registrations. All admin access is via service_role
--     (bypasses RLS); admin policies below are the defensive second layer.
--   * Registrations are NEVER publicly readable (they contain PII).
-- =============================================================================
alter table event_form_fields   enable row level security;
alter table event_registrations enable row level security;

-- Public can read the form definition for a published event
create policy pub_read_form_fields on event_form_fields for select to anon, authenticated
  using (exists (select 1 from events e where e.id = event_id and e.is_published));

-- Public can submit a registration (rate-limited + validated at the API layer)
create policy pub_insert_registrations on event_registrations for insert to anon, authenticated
  with check (true);

-- Admin (authenticated) full access — defensive; primary access is service_role
create policy admin_all_form_fields on event_form_fields for all to authenticated
  using (is_admin()) with check (is_admin());
create policy admin_all_registrations on event_registrations for all to authenticated
  using (is_admin()) with check (is_admin());
