/**
 * Vercel serverless entry for the ALA API.
 *
 * Reuses the Express app factory, which the Vercel buildCommand compiles to
 * `apps/backend/dist`. vercel.json rewrites `/api/*`, `/sitemap.xml`, and
 * `/health` to this function, so the whole API runs on one Vercel project
 * alongside the static frontend. Local dev still uses apps/backend/src/index.ts.
 */
// @ts-ignore — dist is emitted at build time and ships no type declarations.
import { createApp } from '../apps/backend/dist/app.js';

export default createApp();
