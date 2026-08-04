-- =============================================================================
-- ALA — Row Level Security
-- Migration 0002: enable RLS on all tables + policies
--
-- Model:
--   * Public (anon) can SELECT published content only.
--   * Public (anon) can INSERT into inquiries / newsletter / quote_requests.
--   * All other writes are performed server-side with the service_role key,
--     which BYPASSES RLS. Authenticated-admin policies below are a defensive
--     second layer (e.g. if the admin panel ever reads via the anon/authed key).
-- =============================================================================

-- Enable RLS everywhere
alter table admin_users            enable row level security;
alter table site_settings          enable row level security;
alter table hero_slides            enable row level security;
alter table pages                  enable row level security;
alter table services               enable row level security;
alter table methodology_pillars    enable row level security;
alter table statistics             enable row level security;
alter table partners               enable row level security;
alter table team_members           enable row level security;
alter table timeline_entries       enable row level security;
alter table events                 enable row level security;
alter table event_gallery          enable row level security;
alter table faqs                   enable row level security;
alter table inquiries              enable row level security;
alter table newsletter_subscribers enable row level security;
alter table quote_requests         enable row level security;
alter table media                  enable row level security;
alter table audit_logs             enable row level security;

-- -----------------------------------------------------------------------------
-- Public read: published-only content
-- -----------------------------------------------------------------------------
create policy pub_read_hero      on hero_slides         for select to anon, authenticated using (is_published);
create policy pub_read_pages     on pages               for select to anon, authenticated using (is_published);
create policy pub_read_services  on services            for select to anon, authenticated using (is_published);
create policy pub_read_partners  on partners            for select to anon, authenticated using (is_published);
create policy pub_read_team      on team_members        for select to anon, authenticated using (is_published);
create policy pub_read_faqs      on faqs                for select to anon, authenticated using (is_published);
create policy pub_read_events    on events              for select to anon, authenticated using (is_published);

-- Content with no is_published flag: always public-readable
create policy pub_read_methodology on methodology_pillars for select to anon, authenticated using (true);
create policy pub_read_statistics  on statistics          for select to anon, authenticated using (true);
create policy pub_read_timeline    on timeline_entries    for select to anon, authenticated using (true);
create policy pub_read_settings    on site_settings       for select to anon, authenticated using (true);

-- Gallery readable only when its parent event is published
create policy pub_read_gallery on event_gallery for select to anon, authenticated
  using (exists (select 1 from events e where e.id = event_id and e.is_published));

-- -----------------------------------------------------------------------------
-- Public write: lead-capture endpoints (rate-limited + honeypot at API layer)
-- -----------------------------------------------------------------------------
create policy pub_insert_inquiries  on inquiries              for insert to anon, authenticated with check (true);
create policy pub_insert_newsletter on newsletter_subscribers for insert to anon, authenticated with check (true);
create policy pub_insert_quotes     on quote_requests        for insert to anon, authenticated with check (true);

-- -----------------------------------------------------------------------------
-- Admin read (defensive; primary admin access is via service_role which
-- bypasses RLS). Lets an authenticated admin session read everything.
-- -----------------------------------------------------------------------------
create policy admin_all_hero        on hero_slides            for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_pages       on pages                  for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_services    on services               for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_methodology on methodology_pillars    for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_statistics  on statistics             for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_partners    on partners               for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_team        on team_members           for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_timeline    on timeline_entries       for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_events      on events                 for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_gallery     on event_gallery          for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_faqs        on faqs                   for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_settings    on site_settings          for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_inquiries   on inquiries              for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_newsletter  on newsletter_subscribers for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_quotes      on quote_requests        for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_all_media       on media                  for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_read_audit      on audit_logs             for select to authenticated using (is_admin());

-- admin_users: a user can read their own row; super_admins manage all
create policy admin_self_read   on admin_users for select to authenticated using (auth_uid = auth.uid() or is_super_admin());
create policy admin_super_write on admin_users for all    to authenticated using (is_super_admin()) with check (is_super_admin());
