/**
 * Vercel serverless entry for the ALA API.
 *
 * Lazily loads the Express app (compiled to apps/backend/dist by the Vercel
 * buildCommand) so any initialization error — e.g. missing Supabase env vars —
 * is caught and returned as a readable JSON 500 instead of an opaque
 * FUNCTION_INVOCATION_FAILED. vercel.json rewrites /api/*, /sitemap.xml, and
 * /health to this function. Local dev still uses apps/backend/src/index.ts.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

type NodeHandler = (req: IncomingMessage, res: ServerResponse) => void;

let appPromise: Promise<NodeHandler> | null = null;

function loadApp(): Promise<NodeHandler> {
  if (!appPromise) {
    // @ts-ignore — dist is emitted at build time and ships no type declarations.
    appPromise = import('../apps/backend/dist/app.js').then((m) => m.createApp() as NodeHandler);
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await loadApp();
    return app(req, res);
  } catch (err) {
    appPromise = null; // let a later request retry after the cause is fixed
    const message = err instanceof Error ? err.message : String(err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ success: false, error: { code: 'INIT_FAILED', message } }));
  }
}
