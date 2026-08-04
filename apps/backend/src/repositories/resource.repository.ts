import { supabaseAdmin } from '../lib/supabase.js';
import { NotFound } from '../utils/errors.js';

export interface ListParams {
  publishedOnly?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
  searchColumns?: string[];
  sort?: string;
  order?: 'asc' | 'desc';
  defaultSort?: string;
  defaultOrder?: 'asc' | 'desc';
}

/**
 * Generic table repository over the Supabase service-role client.
 * One instance per table; the service layer applies business rules.
 */
export class ResourceRepository<Row extends { id: string }> {
  constructor(private readonly table: string) {}

  private base() {
    return supabaseAdmin.from(this.table);
  }

  async list(params: ListParams): Promise<{ rows: Row[]; total: number }> {
    const {
      publishedOnly = false,
      page = 1,
      pageSize = 100,
      search,
      searchColumns = [],
      sort,
      order = 'asc',
      defaultSort = 'sort_order',
      defaultOrder = 'asc',
    } = params;

    let q = this.base().select('*', { count: 'exact' });

    if (publishedOnly) q = q.eq('is_published', true);

    if (search && searchColumns.length) {
      // OR ilike across the configured searchable columns
      const or = searchColumns.map((c) => `${c}.ilike.%${search}%`).join(',');
      q = q.or(or);
    }

    const sortCol = sort ?? defaultSort;
    const sortAsc = (sort ? order : defaultOrder) === 'asc';
    q = q.order(sortCol, { ascending: sortAsc });

    const from = (page - 1) * pageSize;
    q = q.range(from, from + pageSize - 1);

    const { data, error, count } = await q;
    if (error) throw error;
    return { rows: (data ?? []) as Row[], total: count ?? 0 };
  }

  async getById(id: string, publishedOnly = false): Promise<Row> {
    let q = this.base().select('*').eq('id', id);
    if (publishedOnly) q = q.eq('is_published', true);
    const { data, error } = await q.maybeSingle();
    if (error) throw error;
    if (!data) throw NotFound();
    return data as Row;
  }

  async getBySlug(slug: string, publishedOnly = false): Promise<Row> {
    let q = this.base().select('*').eq('slug', slug);
    if (publishedOnly) q = q.eq('is_published', true);
    const { data, error } = await q.maybeSingle();
    if (error) throw error;
    if (!data) throw NotFound();
    return data as Row;
  }

  async create(payload: Record<string, unknown>): Promise<Row> {
    const { data, error } = await this.base().insert(payload).select('*').single();
    if (error) throw error;
    return data as Row;
  }

  async update(id: string, payload: Record<string, unknown>): Promise<Row> {
    const { data, error } = await this.base()
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw NotFound();
    return data as Row;
  }

  async remove(id: string): Promise<void> {
    const { data, error } = await this.base().delete().eq('id', id).select('id').maybeSingle();
    if (error) throw error;
    if (!data) throw NotFound();
  }

  async reorder(items: { id: string; sort_order: number }[]): Promise<void> {
    // Sequential updates keep it simple and index-friendly for small lists.
    for (const it of items) {
      const { error } = await this.base().update({ sort_order: it.sort_order }).eq('id', it.id);
      if (error) throw error;
    }
  }
}
