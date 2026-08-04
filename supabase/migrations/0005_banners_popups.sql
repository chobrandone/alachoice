-- =============================================================================
-- ALA — Announcement Banners & Popup Manager
-- Migration 0005: announcements, popups
-- Postgres 17 / Supabase
-- =============================================================================

-- =============================================================================
-- ANNOUNCEMENTS — persistent top-of-site banner(s), rotating & scheduled
-- =============================================================================
create table if not exists announcements (
  id             uuid primary key default gen_random_uuid(),
  message_en     text not null,
  message_fr     text,
  link_url       text,
  link_label_en  text,
  link_label_fr  text,
  style          text not null default 'info',   -- info | success | warning | promo
  dismissible    boolean not null default true,
  starts_at      timestamptz,
  ends_at        timestamptz,
  sort_order     int not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_announcements_updated before update on announcements
  for each row execute function set_updated_at();
create index if not exists idx_announcements_order on announcements (sort_order) where is_published;

-- =============================================================================
-- POPUPS — admin-managed modal popups with triggers & targeting
-- =============================================================================
create table if not exists popups (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,                  -- admin reference label
  title_en       text,
  title_fr       text,
  body_en        text,
  body_fr        text,
  image_url      text,
  cta_label_en   text,
  cta_label_fr   text,
  cta_url        text,
  trigger        text not null default 'delay',  -- load | delay | scroll | exit_intent
  delay_seconds  int not null default 5,
  scroll_percent int not null default 40,
  frequency      text not null default 'session',-- once | session | always
  target_paths   text,                           -- comma-separated path prefixes; empty = all
  audience       text not null default 'all',    -- all | first_time | returning
  device         text not null default 'all',    -- all | mobile | desktop
  countdown_to   timestamptz,
  show_newsletter boolean not null default false,
  starts_at      timestamptz,
  ends_at        timestamptz,
  sort_order     int not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_popups_updated before update on popups
  for each row execute function set_updated_at();
create index if not exists idx_popups_order on popups (sort_order) where is_published;

-- =============================================================================
-- Row Level Security — public reads published; admin via service_role.
-- =============================================================================
alter table announcements enable row level security;
alter table popups        enable row level security;

create policy pub_read_announcements on announcements for select to anon, authenticated using (is_published);
create policy pub_read_popups        on popups        for select to anon, authenticated using (is_published);

create policy admin_all_announcements on announcements for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_popups        on popups        for all to authenticated using (is_admin()) with check (is_admin());
