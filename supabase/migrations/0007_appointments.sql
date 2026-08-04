-- =============================================================================
-- ALA — Appointment Booking (Phase 4B)
-- Migration 0007: availability_slots, appointments
-- Postgres 17 / Supabase
-- =============================================================================

do $$ begin
  create type appointment_status as enum ('requested', 'confirmed', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- =============================================================================
-- AVAILABILITY SLOTS — admin-defined bookable times
-- =============================================================================
create table if not exists availability_slots (
  id               uuid primary key default gen_random_uuid(),
  consultant_id    uuid references team_members(id) on delete set null,
  starts_at        timestamptz not null,
  duration_minutes int not null default 30,
  mode             text not null default 'both',   -- online | physical | both
  is_booked        boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger trg_slots_updated before update on availability_slots
  for each row execute function set_updated_at();
create index if not exists idx_slots_open on availability_slots (starts_at)
  where is_active and not is_booked;

-- =============================================================================
-- APPOINTMENTS — client bookings
-- =============================================================================
create table if not exists appointments (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references clients(id) on delete cascade,
  slot_id          uuid references availability_slots(id) on delete set null,
  service_id       uuid references services(id) on delete set null,
  consultant_id    uuid references team_members(id) on delete set null,
  scheduled_at     timestamptz not null,
  duration_minutes int not null default 30,
  mode             text not null default 'online',  -- online | physical
  status           appointment_status not null default 'requested',
  location         text,
  meeting_link     text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger trg_appointments_updated before update on appointments
  for each row execute function set_updated_at();
create index if not exists idx_appts_client on appointments (client_id, scheduled_at desc);
create index if not exists idx_appts_status on appointments (status, scheduled_at);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table availability_slots enable row level security;
alter table appointments       enable row level security;

-- Authenticated clients may read active slots (to book); public site doesn't need them.
create policy read_active_slots on availability_slots for select to authenticated
  using (is_active);

-- Clients own their appointments.
create policy client_own_appts on appointments for all to authenticated
  using (client_id = current_client_id()) with check (client_id = current_client_id());

-- Admin (service_role bypasses RLS; covers an authenticated admin session).
create policy admin_all_slots on availability_slots for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_appts on appointments      for all to authenticated using (is_admin()) with check (is_admin());
