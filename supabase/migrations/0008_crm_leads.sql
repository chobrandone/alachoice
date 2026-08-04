-- =============================================================================
-- ALA — CRM / Lead Management (Phase 5)
-- Migration 0008: leads, lead_notes, lead_tasks
-- Postgres 17 / Supabase
-- =============================================================================

do $$ begin
  create type lead_source as enum ('inquiry', 'quote', 'application', 'event_registration', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost');
exception when duplicate_object then null; end $$;

-- =============================================================================
-- LEADS — unified pipeline row for every inbound contact
-- =============================================================================
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  source      lead_source not null default 'manual',
  source_id   uuid,                                  -- origin row id (nullable for manual)
  name        text not null,
  email       text,
  phone       text,
  country     text,
  subject     text,
  status      lead_status not null default 'new',
  assigned_to uuid references admin_users(id) on delete set null,
  value       numeric,                               -- optional estimated value
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_leads_updated before update on leads
  for each row execute function set_updated_at();
-- One lead per source row (lets auto-creation be idempotent). Full index so
-- ON CONFLICT (source, source_id) has an arbiter; NULL source_ids (manual leads)
-- stay distinct per SQL null-handling.
create unique index if not exists uq_leads_source on leads (source, source_id);
create index if not exists idx_leads_status on leads (status, created_at desc);
create index if not exists idx_leads_assignee on leads (assigned_to, created_at desc);

-- =============================================================================
-- LEAD NOTES — communication history / internal notes timeline
-- =============================================================================
create table if not exists lead_notes (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references leads(id) on delete cascade,
  admin_user_id uuid references admin_users(id) on delete set null,
  body          text not null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_lead_notes_lead on lead_notes (lead_id, created_at desc);

-- =============================================================================
-- LEAD TASKS — follow-up reminders
-- =============================================================================
create table if not exists lead_tasks (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references leads(id) on delete cascade,
  admin_user_id uuid references admin_users(id) on delete set null,
  title         text not null,
  due_at        timestamptz,
  is_done       boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_lead_tasks_updated before update on lead_tasks
  for each row execute function set_updated_at();
create index if not exists idx_lead_tasks_lead on lead_tasks (lead_id, due_at);

-- =============================================================================
-- RLS — CRM is admin-only (service_role bypasses; policy covers authed admins).
-- =============================================================================
alter table leads      enable row level security;
alter table lead_notes enable row level security;
alter table lead_tasks enable row level security;

create policy admin_all_leads      on leads      for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_lead_notes on lead_notes for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_lead_tasks on lead_tasks for all to authenticated using (is_admin()) with check (is_admin());
