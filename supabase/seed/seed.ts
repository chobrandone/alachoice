/**
 * Seed the ALA database with baseline content from alachoice.com.
 *
 * Usage (from repo root, after setting apps/backend/.env with Supabase creds):
 *   npm run -w @ala/backend seed
 *
 * Idempotent: content with a natural key (site_settings.key, services/pages/
 * events.slug) is upserted; the flat lists (hero, methodology, statistics,
 * faqs, team, timeline) are cleared and re-inserted so re-running resets them
 * to this baseline. It never touches submissions, media, users, or audit logs.
 */
import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  siteSettings,
  heroSlides,
  services,
  methodologyPillars,
  statistics,
  faqs,
  teamMembers,
  timelineEntries,
  pages,
  events,
} from './data.js';

// Load env from the API workspace .env (run via `npm run -w @ala/backend seed`,
// so cwd is apps/backend). Falls back to any already-set process env.
loadEnv({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    '\n❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
      '   Set them in apps/backend/.env, then run: npm run -w @ala/backend seed\n',
  );
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

async function upsert(table: string, rows: unknown[], onConflict: string) {
  const { error } = await db.from(table).upsert(rows as never, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ✓ ${table} (${rows.length}) upserted`);
}

async function reset(table: string, rows: unknown[]) {
  // Clear then insert. Delete-all guard: match any non-null id.
  const { error: delErr } = await db.from(table).delete().not('id', 'is', null);
  if (delErr) throw new Error(`${table} (clear): ${delErr.message}`);
  if (rows.length) {
    const { error } = await db.from(table).insert(rows as never);
    if (error) throw new Error(`${table} (insert): ${error.message}`);
  }
  console.log(`  ✓ ${table} (${rows.length}) reset`);
}

async function main() {
  console.log(`\n🌱 Seeding ALA content → ${url}\n`);

  await upsert('site_settings', siteSettings, 'key');
  await upsert('pages', pages, 'slug');
  await upsert('events', events, 'slug');

  // Services are the full catalog (4 ALA pillars). Reset so an old catalog is
  // replaced wholesale, not merged. inquiries/quote_requests.service_id is
  // `on delete set null`, so clearing services only nulls those references.
  await reset('services', services);
  await reset('hero_slides', heroSlides);
  await reset('methodology_pillars', methodologyPillars);
  await reset('statistics', statistics);
  await reset('faqs', faqs);
  await reset('team_members', teamMembers);
  await reset('timeline_entries', timelineEntries);

  console.log('\n✅ Seed complete.\n');
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err.message, '\n');
  process.exit(1);
});
