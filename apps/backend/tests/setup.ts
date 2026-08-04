/**
 * Test env — set BEFORE any module imports config/env.ts, which validates and
 * would otherwise exit the process. Values are dummies; the Supabase client is
 * mocked in tests that touch the database.
 */
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL ??= 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY ??= 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test-service-role-key';
process.env.SITE_URL ??= 'https://alachoice.com';
process.env.CORS_ORIGINS ??= 'http://localhost:5173';
