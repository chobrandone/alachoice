-- =============================================================================
-- ALA (American Liaison in Africa) — Core Schema
-- Migration 0001: extensions, enums, tables, indexes, updated_at triggers
-- Postgres 17 / Supabase
-- =============================================================================

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";        -- fuzzy search on admin tables

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type admin_role   as enum ('super_admin', 'editor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('upcoming', 'past');
exception when duplicate_object then null; end $$;

do $$ begin
  create type submission_status as enum ('new', 'read', 'replied', 'archived');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- Shared updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- =============================================================================
-- AUTH / ROLES
-- =============================================================================
create table admin_users (
  id         uuid primary key default gen_random_uuid(),
  auth_uid   uuid unique references auth.users(id) on delete cascade,
  full_name  text not null,
  email      text not null unique,
  role       admin_role not null default 'editor',
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_admin_users_updated before update on admin_users
  for each row execute function set_updated_at();

-- Helper: is the current JWT an active admin?
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from admin_users
    where auth_uid = auth.uid() and is_active = true
  );
$$;

-- Helper: is the current JWT a super_admin?
create or replace function is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from admin_users
    where auth_uid = auth.uid() and is_active = true and role = 'super_admin'
  );
$$;

-- =============================================================================
-- CONTENT
-- =============================================================================

-- Key/value store for contacts, hours, socials, popup config, SEO defaults
create table site_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  value_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger trg_site_settings_updated before update on site_settings
  for each row execute function set_updated_at();

create table hero_slides (
  id                   uuid primary key default gen_random_uuid(),
  title_en             text not null,
  title_fr             text,
  eyebrow_en           text,
  eyebrow_fr           text,
  subtitle_en          text,
  subtitle_fr          text,
  image_url            text,
  cta_primary_label    text,
  cta_primary_url      text,
  cta_secondary_label  text,
  cta_secondary_url    text,
  sort_order           int not null default 0,
  is_published         boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create trigger trg_hero_slides_updated before update on hero_slides
  for each row execute function set_updated_at();
create index idx_hero_slides_order on hero_slides (sort_order) where is_published;

create table pages (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title_en        text not null,
  title_fr        text,
  body_en         text,
  body_fr         text,
  hero_image_url  text,
  seo_title       text,
  seo_description text,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_pages_updated before update on pages
  for each row execute function set_updated_at();

create table services (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title_en        text not null,
  title_fr        text,
  excerpt_en      text,
  excerpt_fr      text,
  body_en         text,
  body_fr         text,
  icon_name       text,                 -- Lucide icon name
  cover_image_url text,
  sort_order      int not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_services_updated before update on services
  for each row execute function set_updated_at();
create index idx_services_order on services (sort_order) where is_published;

create table methodology_pillars (
  id             uuid primary key default gen_random_uuid(),
  title_en       text not null,
  title_fr       text,
  description_en text,
  description_fr text,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_methodology_updated before update on methodology_pillars
  for each row execute function set_updated_at();

create table statistics (
  id         uuid primary key default gen_random_uuid(),
  label_en   text not null,
  label_fr   text,
  value      numeric not null default 0,
  suffix     text,                       -- e.g. '+', '%'
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_statistics_updated before update on statistics
  for each row execute function set_updated_at();

create table partners (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  logo_url     text,
  website_url  text,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_partners_updated before update on partners
  for each row execute function set_updated_at();

create table team_members (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  role_en      text,
  role_fr      text,
  bio_en       text,
  bio_fr       text,
  photo_url    text,
  linkedin_url text,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_team_updated before update on team_members
  for each row execute function set_updated_at();

create table timeline_entries (
  id             uuid primary key default gen_random_uuid(),
  year           text not null,
  title_en       text not null,
  title_fr       text,
  description_en text,
  description_fr text,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_timeline_updated before update on timeline_entries
  for each row execute function set_updated_at();

create table events (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title_en         text not null,
  title_fr         text,
  description_en   text,
  description_fr   text,
  body_en          text,
  body_fr          text,
  poster_url       text,
  start_date       timestamptz,
  end_date         timestamptz,
  location         text,
  registration_url text,
  status           event_status not null default 'upcoming',
  is_featured      boolean not null default false,
  is_published     boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger trg_events_updated before update on events
  for each row execute function set_updated_at();
create index idx_events_start on events (start_date desc);
create index idx_events_status on events (status) where is_published;

create table event_gallery (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  image_url  text not null,
  caption    text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_event_gallery_event on event_gallery (event_id, sort_order);

create table faqs (
  id           uuid primary key default gen_random_uuid(),
  question_en  text not null,
  question_fr  text,
  answer_en    text,
  answer_fr    text,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_faqs_updated before update on faqs
  for each row execute function set_updated_at();

-- =============================================================================
-- SUBMISSIONS
-- =============================================================================
create table inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  service_id uuid references services(id) on delete set null,
  message    text not null,
  source     text default 'website',
  status     submission_status not null default 'new',
  created_at timestamptz not null default now()
);
create index idx_inquiries_status on inquiries (status, created_at desc);

create table newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table quote_requests (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  phone        text,
  service_id   uuid references services(id) on delete set null,
  budget_range text,
  details      text,
  status       submission_status not null default 'new',
  created_at   timestamptz not null default now()
);
create index idx_quote_status on quote_requests (status, created_at desc);

-- =============================================================================
-- OPS
-- =============================================================================
create table media (
  id          uuid primary key default gen_random_uuid(),
  file_url    text not null,
  file_name   text not null,
  mime_type   text,
  size_bytes  bigint,
  bucket      text not null,
  alt_text    text,                      -- stored with media for a11y
  uploaded_by uuid references admin_users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index idx_media_bucket on media (bucket, created_at desc);

create table audit_logs (
  id            uuid primary key default gen_random_uuid(),
  admin_user_id uuid references admin_users(id) on delete set null,
  action        text not null,           -- create | update | delete
  entity        text not null,           -- table name
  entity_id     uuid,
  diff_json     jsonb,
  ip            text,
  created_at    timestamptz not null default now()
);
create index idx_audit_entity on audit_logs (entity, created_at desc);
