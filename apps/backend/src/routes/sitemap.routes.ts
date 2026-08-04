import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { env } from '../config/env.js';

/**
 * Dynamic sitemap.xml built from published, DB-driven content.
 * Mounted on the app root (not under /api/v1). robots.txt on the web
 * front end points search engines here.
 */
export const sitemapRouter = Router();

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const STATIC_ROUTES: UrlEntry[] = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/about', changefreq: 'monthly', priority: '0.8' },
  { loc: '/services', changefreq: 'monthly', priority: '0.8' },
  { loc: '/ata', changefreq: 'monthly', priority: '0.7' },
  { loc: '/events', changefreq: 'weekly', priority: '0.7' },
  { loc: '/contact', changefreq: 'yearly', priority: '0.5' },
];

function xmlEscape(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string,
  );
}

function toXml(base: string, entries: UrlEntry[]): string {
  const urls = entries
    .map((e) => {
      const parts = [`    <loc>${xmlEscape(base + e.loc)}</loc>`];
      if (e.lastmod) parts.push(`    <lastmod>${e.lastmod.slice(0, 10)}</lastmod>`);
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority) parts.push(`    <priority>${e.priority}</priority>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

sitemapRouter.get(
  '/sitemap.xml',
  asyncHandler(async (_req, res) => {
    const base = env.SITE_URL.replace(/\/$/, '');
    const entries: UrlEntry[] = [...STATIC_ROUTES];

    // Detail pages from published, slugged content. Failures degrade to the
    // static routes rather than erroring the whole sitemap.
    const [services, events, pages] = await Promise.all([
      supabaseAdmin.from('services').select('slug, updated_at').eq('is_published', true),
      supabaseAdmin.from('events').select('slug, updated_at').eq('is_published', true),
      supabaseAdmin.from('pages').select('slug, updated_at').eq('is_published', true),
    ]);

    for (const s of services.data ?? [])
      entries.push({ loc: `/services/${s.slug}`, lastmod: s.updated_at, changefreq: 'monthly', priority: '0.7' });
    for (const ev of events.data ?? [])
      entries.push({ loc: `/events/${ev.slug}`, lastmod: ev.updated_at, changefreq: 'weekly', priority: '0.6' });
    // Custom pages already covered by static routes (about, ata) are skipped.
    for (const p of pages.data ?? []) {
      if (STATIC_ROUTES.some((r) => r.loc === `/${p.slug}`)) continue;
      entries.push({ loc: `/${p.slug}`, lastmod: p.updated_at, changefreq: 'monthly', priority: '0.6' });
    }

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(toXml(base, entries));
  }),
);
