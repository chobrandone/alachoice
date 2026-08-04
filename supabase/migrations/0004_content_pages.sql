-- =============================================================================
-- ALA — Content & Pages expansion
-- Migration 0004: countries, news_articles, testimonials
-- Postgres 17 / Supabase
-- =============================================================================

-- =============================================================================
-- COUNTRIES — destination pages (USA, Canada, UK, …)
-- =============================================================================
create table if not exists countries (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  name_en                text not null,
  name_fr                text,
  flag_emoji             text,
  hero_image_url         text,
  summary_en             text,
  summary_fr             text,
  overview_en            text,
  overview_fr            text,
  immigration_en         text,
  immigration_fr         text,
  study_en               text,
  study_fr               text,
  living_costs_en        text,
  living_costs_fr        text,
  visa_requirements_en   text,
  visa_requirements_fr   text,
  processing_times_en    text,
  processing_times_fr    text,
  faqs                   jsonb not null default '[]'::jsonb,  -- [{question_en,question_fr,answer_en,answer_fr}]
  sort_order             int not null default 0,
  is_published           boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create trigger trg_countries_updated before update on countries
  for each row execute function set_updated_at();
create index if not exists idx_countries_order on countries (sort_order) where is_published;

-- =============================================================================
-- NEWS ARTICLES — news center / blog
-- =============================================================================
create table if not exists news_articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title_en      text not null,
  title_fr      text,
  summary_en    text,
  summary_fr    text,
  body_en       text,
  body_fr       text,
  cover_image_url text,
  category      text not null default 'announcements',
  author        text,
  published_at  timestamptz not null default now(),
  is_featured   boolean not null default false,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_news_updated before update on news_articles
  for each row execute function set_updated_at();
create index if not exists idx_news_published on news_articles (published_at desc) where is_published;
create index if not exists idx_news_category on news_articles (category, published_at desc);

-- =============================================================================
-- TESTIMONIALS — success stories (written + video), filterable
-- =============================================================================
create table if not exists testimonials (
  id             uuid primary key default gen_random_uuid(),
  author_name    text not null,
  author_role_en text,
  author_role_fr text,
  country        text,
  service_id     uuid references services(id) on delete set null,
  quote_en       text not null,
  quote_fr       text,
  photo_url      text,
  video_url      text,
  rating         int,
  sort_order     int not null default 0,
  is_featured    boolean not null default false,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_testimonials_updated before update on testimonials
  for each row execute function set_updated_at();
create index if not exists idx_testimonials_order on testimonials (sort_order) where is_published;

-- =============================================================================
-- Row Level Security — public reads published rows; admin via service_role.
-- =============================================================================
alter table countries      enable row level security;
alter table news_articles  enable row level security;
alter table testimonials   enable row level security;

create policy pub_read_countries    on countries     for select to anon, authenticated using (is_published);
create policy pub_read_news         on news_articles for select to anon, authenticated using (is_published);
create policy pub_read_testimonials on testimonials  for select to anon, authenticated using (is_published);

create policy admin_all_countries    on countries     for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_news         on news_articles for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_testimonials on testimonials  for all to authenticated using (is_admin()) with check (is_admin());
