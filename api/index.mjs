// Vercel serverless entry — wraps the Express app. Vercel routes /api/* and
// /sitemap.xml here (see vercel.json rewrites); Express handles the sub-routing
// (/api/v1/*, /sitemap.xml, /health). The in-process reminder scheduler in
// backend/src/index.ts is NOT used here — Vercel Cron hits /api/v1/cron/reminders.
import { createApp } from '../apps/backend/dist/app.js';

const app = createApp();
export default app;
