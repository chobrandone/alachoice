/**
 * One-off importer: mirror the entire alachoice.com WordPress media library into
 * this project's Supabase Storage + `media` table.
 *
 * Usage (from repo root):  npm run -w @ala/backend import-media
 *
 * - Enumerates every image via the WP REST API (all pages).
 * - Downloads each original and uploads it to the `media` storage bucket under
 *   `alachoice/<filename>` (upsert = safe to re-run).
 * - Registers each in the `media` table (idempotent by file_url).
 * It never deletes existing content; re-running only fills gaps / refreshes bytes.
 */
import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('\n❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in apps/backend/.env\n');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const WP = 'https://alachoice.com/wp-json/wp/v2/media';
const BUCKET = 'media';
const PREFIX = 'alachoice';
const CONCURRENCY = 6;

type WpMedia = { source_url: string; mime_type: string };

async function listWpMedia(): Promise<WpMedia[]> {
  const all: WpMedia[] = [];
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`${WP}?per_page=100&page=${page}&_fields=source_url,mime_type`, {
      headers: { Accept: 'application/json' },
    });
    if (res.status === 400) break; // past last page
    if (!res.ok) throw new Error(`WP media list page ${page}: ${res.status}`);
    const batch = (await res.json()) as WpMedia[];
    if (!batch.length) break;
    all.push(...batch);
    const totalPages = Number(res.headers.get('X-WP-TotalPages') || '1');
    if (page >= totalPages) break;
  }
  // images only
  return all.filter((m) => (m.mime_type || '').startsWith('image/'));
}

async function ensureBucket() {
  const { data: buckets } = await db.storage.listBuckets();
  console.log('  buckets:', (buckets ?? []).map((b) => `${b.name}${b.public ? '(public)' : ''}`).join(', ') || '(none)');
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await db.storage.createBucket(BUCKET, { public: true });
    if (error && !/already exists/i.test(error.message)) throw error;
    console.log(`  created public bucket "${BUCKET}"`);
  }
}

function objectPath(sourceUrl: string): string {
  // Preserve the WP year/month sub-path to avoid name collisions.
  const u = new URL(sourceUrl);
  const rel = u.pathname.replace(/^.*\/wp-content\/uploads\//, '');
  return `${PREFIX}/${rel}`;
}

async function existingFileUrls(): Promise<Set<string>> {
  const set = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from('media').select('file_url').range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    data.forEach((r: { file_url: string }) => set.add(r.file_url));
    if (data.length < 1000) break;
  }
  return set;
}

async function run() {
  console.log(`\n📥 Importing alachoice.com media → ${url}\n`);
  await ensureBucket();
  const media = await listWpMedia();
  console.log(`  found ${media.length} images on alachoice.com`);
  const already = await existingFileUrls();

  let uploaded = 0,
    skipped = 0,
    failed = 0;
  const rowsToInsert: Record<string, unknown>[] = [];

  async function worker(item: WpMedia) {
    const key = objectPath(item.source_url);
    const publicUrl = db.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
    try {
      const res = await fetch(item.source_url);
      if (!res.ok) throw new Error(`download ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const { error: upErr } = await db.storage
        .from(BUCKET)
        .upload(key, buf, { contentType: item.mime_type || 'application/octet-stream', upsert: true });
      if (upErr) throw upErr;
      uploaded++;
      if (!already.has(publicUrl)) {
        rowsToInsert.push({
          file_url: publicUrl,
          file_name: key.split('/').pop(),
          mime_type: item.mime_type,
          size_bytes: buf.length,
          bucket: BUCKET,
        });
      } else {
        skipped++;
      }
      if (uploaded % 20 === 0) console.log(`  …${uploaded} uploaded`);
    } catch (e) {
      failed++;
      console.warn(`  ✗ ${item.source_url} — ${(e as Error).message}`);
    }
  }

  // simple concurrency pool
  const queue = [...media];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length) {
        const item = queue.shift();
        if (item) await worker(item);
      }
    }),
  );

  // insert new media rows in chunks
  for (let i = 0; i < rowsToInsert.length; i += 200) {
    const chunk = rowsToInsert.slice(i, i + 200);
    const { error } = await db.from('media').insert(chunk);
    if (error) throw new Error(`media insert: ${error.message}`);
  }

  console.log(
    `\n✅ Done. storage uploaded/refreshed: ${uploaded}, new media rows: ${rowsToInsert.length}, already-registered: ${skipped}, failed: ${failed}\n`,
  );
}

run().catch((err) => {
  console.error('\n❌ import-media failed:', err.message, '\n');
  process.exit(1);
});
