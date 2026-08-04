/**
 * Bootstrap the FIRST super-admin (the Users admin API requires an existing
 * super-admin, so this solves the chicken-and-egg). Creates a Supabase Auth
 * user + the matching admin_users row.
 *
 * Usage (cwd = apps/backend, so `.env` is picked up):
 *   npm run -w @ala/backend create-admin -- "you@example.com" "StrongPass123" "Your Name"
 * or via env vars ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME.
 */
import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: path.resolve(process.cwd(), '.env') });

const [, , argEmail, argPassword, ...argName] = process.argv;
const email = argEmail ?? process.env.ADMIN_EMAIL;
const password = argPassword ?? process.env.ADMIN_PASSWORD;
const fullName = argName.join(' ') || process.env.ADMIN_NAME || 'ALA Administrator';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('\n❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in apps/backend/.env\n');
  process.exit(1);
}
if (!email || !password) {
  console.error(
    '\n❌ Email and password required.\n' +
      '   npm run -w @ala/backend create-admin -- "you@example.com" "StrongPass123" "Your Name"\n',
  );
  process.exit(1);
}
if (password.length < 8) {
  console.error('\n❌ Password must be at least 8 characters.\n');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log(`\n👤 Creating super-admin ${email} …`);

  const { data: authRes, error: authErr } = await db.auth.admin.createUser({
    email: email!,
    password: password!,
    email_confirm: true,
  });
  if (authErr || !authRes.user) throw new Error(authErr?.message ?? 'Could not create auth user');

  const { error } = await db.from('admin_users').insert({
    auth_uid: authRes.user.id,
    full_name: fullName,
    email,
    role: 'super_admin',
    is_active: true,
  });

  if (error) {
    // Roll back the orphaned auth user so a retry with the same email works.
    await db.auth.admin.deleteUser(authRes.user.id).catch(() => {});
    throw error;
  }

  console.log(`\n✅ Super-admin created. Sign in at /admin/login with ${email}\n`);
}

main().catch((err) => {
  console.error('\n❌ Failed:', err.message, '\n');
  process.exit(1);
});
