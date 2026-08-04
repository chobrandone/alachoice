import { ResourceRepository } from '../repositories/resource.repository.js';
import type { ResourceConfig } from '../config/resources.js';
import type { ListParams } from '../repositories/resource.repository.js';

/**
 * Thin service over the generic repository. Holds the per-resource config and
 * exposes intent-named methods the controller calls. Business rules that go
 * beyond plain CRUD live in dedicated services (auth, events, inquiries, media).
 */
export class ResourceService<Row extends { id: string }> {
  readonly repo: ResourceRepository<Row>;

  constructor(readonly config: ResourceConfig) {
    this.repo = new ResourceRepository<Row>(config.table);
  }

  list(params: Omit<ListParams, 'searchColumns' | 'defaultSort' | 'defaultOrder'>) {
    return this.repo.list({
      ...params,
      searchColumns: this.config.searchColumns,
      defaultSort: this.config.defaultSort,
      defaultOrder: this.config.defaultOrder,
    });
  }

  getById(id: string, publishedOnly = false) {
    return this.repo.getById(id, publishedOnly);
  }

  getBySlug(slug: string, publishedOnly = false) {
    return this.repo.getBySlug(slug, publishedOnly);
  }

  create(payload: Record<string, unknown>) {
    return this.repo.create(payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.repo.update(id, payload);
  }

  remove(id: string) {
    return this.repo.remove(id);
  }

  reorder(items: { id: string; sort_order: number }[]) {
    return this.repo.reorder(items);
  }
}

/** Cache one service instance per resource. */
const cache = new Map<string, ResourceService<{ id: string }>>();
export function serviceFor(config: ResourceConfig) {
  let s = cache.get(config.path);
  if (!s) {
    s = new ResourceService(config);
    cache.set(config.path, s);
  }
  return s;
}
