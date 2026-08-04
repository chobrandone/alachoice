import { supabaseAdmin } from '../lib/supabase.js';
import { NotFound } from '../utils/errors.js';
import type { EventGalleryItemInput } from '@ala/types';

interface PublicListOpts {
  status?: 'upcoming' | 'past';
  featured?: boolean;
  page: number;
  pageSize: number;
}

export async function listPublicEvents(opts: PublicListOpts) {
  let q = supabaseAdmin
    .from('events')
    .select('*', { count: 'exact' })
    .eq('is_published', true);

  if (opts.status) q = q.eq('status', opts.status);
  if (opts.featured) q = q.eq('is_featured', true);

  // Upcoming ascending (soonest first); past descending (most recent first).
  q = q.order('start_date', { ascending: opts.status === 'upcoming' });

  const from = (opts.page - 1) * opts.pageSize;
  const { data, error, count } = await q.range(from, from + opts.pageSize - 1);
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function getPublicEventBySlug(slug: string) {
  const { data: ev, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  if (!ev) throw NotFound('Event not found');

  const { data: gallery, error: gErr } = await supabaseAdmin
    .from('event_gallery')
    .select('*')
    .eq('event_id', ev.id)
    .order('sort_order', { ascending: true });
  if (gErr) throw gErr;

  return { ...ev, gallery: gallery ?? [] };
}

/** All gallery photos across published events (for the public Gallery page). */
export async function listAllGallery() {
  const { data, error } = await supabaseAdmin
    .from('event_gallery')
    .select('id, image_url, caption, created_at, events!inner(slug, title_en, is_published)')
    .eq('events.is_published', true)
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  return (data ?? []).map((r) => {
    const ev = (r as { events?: { slug?: string; title_en?: string } }).events;
    return {
      id: r.id,
      image_url: r.image_url,
      caption: r.caption,
      event_slug: ev?.slug ?? null,
      event_title: ev?.title_en ?? null,
    };
  });
}

/** The single featured upcoming event for the Home page card. */
export async function getNextFeaturedEvent() {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('is_published', true)
    .eq('status', 'upcoming')
    .order('is_featured', { ascending: false })
    .order('start_date', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data; // may be null
}

/* ---- Gallery sub-CRUD (admin) ---- */
export async function addGalleryItem(eventId: string, input: EventGalleryItemInput) {
  const { data, error } = await supabaseAdmin
    .from('event_gallery')
    .insert({ ...input, event_id: eventId })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGalleryItem(id: string) {
  const { data, error } = await supabaseAdmin
    .from('event_gallery')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw NotFound('Gallery item not found');
}

export async function reorderGallery(items: { id: string; sort_order: number }[]) {
  for (const it of items) {
    const { error } = await supabaseAdmin
      .from('event_gallery')
      .update({ sort_order: it.sort_order })
      .eq('id', it.id);
    if (error) throw error;
  }
}
