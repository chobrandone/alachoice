import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock the Supabase client so the sitemap builds from deterministic rows.
vi.mock('../src/lib/supabase.js', () => {
  const dataByTable: Record<string, unknown[]> = {
    services: [{ slug: 'business-development', updated_at: '2026-01-01T00:00:00Z' }],
    events: [{ slug: 'us-africa-business-summit-2026', updated_at: '2026-02-01T00:00:00Z' }],
    pages: [
      { slug: 'about', updated_at: '2026-03-01T00:00:00Z' }, // duplicates a static route
      { slug: 'privacy', updated_at: '2026-03-02T00:00:00Z' },
    ],
  };
  const client = {
    from: (table: string) => ({
      select: () => ({
        eq: () => Promise.resolve({ data: dataByTable[table] ?? [], error: null }),
      }),
    }),
  };
  return { supabaseAdmin: client, supabaseAnon: client };
});

const { createApp } = await import('../src/app.js');
const app = createApp();

describe('GET /sitemap.xml', () => {
  it('serves valid XML with static and dynamic routes', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('xml');
    expect(res.text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    // Static top-level route
    expect(res.text).toContain('<loc>https://alachoice.com/</loc>');
    // Dynamic detail pages from published content
    expect(res.text).toContain('<loc>https://alachoice.com/services/business-development</loc>');
    expect(res.text).toContain(
      '<loc>https://alachoice.com/events/us-africa-business-summit-2026</loc>',
    );
    // Custom page included…
    expect(res.text).toContain('<loc>https://alachoice.com/privacy</loc>');
  });

  it('does not duplicate a page that already exists as a static route', async () => {
    const res = await request(app).get('/sitemap.xml');
    const aboutCount = (res.text.match(/alachoice\.com\/about</g) ?? []).length;
    expect(aboutCount).toBe(1);
  });
});
