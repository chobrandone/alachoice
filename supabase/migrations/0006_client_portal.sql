-- =============================================================================
-- ALA — Client Portal (foundation)
-- Migration 0006: clients, applications, client_documents
-- Postgres 17 / Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type application_status as enum
    ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type document_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- =============================================================================
-- CLIENTS — public portal user profiles (linked to auth.users)
-- =============================================================================
create table if not exists clients (
  id         uuid primary key default gen_random_uuid(),
  auth_uid   uuid unique references auth.users(id) on delete cascade,
  full_name  text not null,
  email      text not null unique,
  phone      text,
  country    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_clients_updated before update on clients
  for each row execute function set_updated_at();

-- Helper: the client row id for the current JWT (used by RLS policies).
create or replace function current_client_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from clients where auth_uid = auth.uid();
$$;

-- =============================================================================
-- APPLICATIONS — multi-step client applications
-- =============================================================================
create table if not exists applications (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients(id) on delete cascade,
  ref          text not null unique,
  type         text not null,                       -- study_abroad | immigration | business | consultation | partnership
  title        text not null,
  status       application_status not null default 'draft',
  data         jsonb not null default '{}'::jsonb,  -- step answers
  progress     int not null default 0,              -- 0..100
  notes        text,                                -- internal admin notes
  submitted_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_applications_updated before update on applications
  for each row execute function set_updated_at();
create index if not exists idx_applications_client on applications (client_id, created_at desc);
create index if not exists idx_applications_status on applications (status, created_at desc);

-- =============================================================================
-- CLIENT DOCUMENTS — uploads with admin approve/reject
-- =============================================================================
create table if not exists client_documents (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references clients(id) on delete cascade,
  application_id uuid references applications(id) on delete set null,
  doc_type       text,                              -- passport | cv | transcript | certificate | photo | other
  file_url       text not null,
  file_name      text not null,
  mime_type      text,
  size_bytes     bigint,
  status         document_status not null default 'pending',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_client_documents_updated before update on client_documents
  for each row execute function set_updated_at();
create index if not exists idx_client_docs_client on client_documents (client_id, created_at desc);

-- =============================================================================
-- Row Level Security
--   Clients access ONLY their own rows (defensive; the API uses service_role
--   and enforces ownership in code). Nothing here is publicly readable.
-- =============================================================================
alter table clients          enable row level security;
alter table applications     enable row level security;
alter table client_documents enable row level security;

create policy client_self       on clients for all to authenticated
  using (auth_uid = auth.uid()) with check (auth_uid = auth.uid());

create policy client_own_apps   on applications for all to authenticated
  using (client_id = current_client_id()) with check (client_id = current_client_id());

create policy client_own_docs   on client_documents for all to authenticated
  using (client_id = current_client_id()) with check (client_id = current_client_id());

-- Admins (service_role bypasses RLS; this covers an authenticated admin session)
create policy admin_all_clients on clients          for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_apps    on applications     for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_docs    on client_documents for all to authenticated using (is_admin()) with check (is_admin());
