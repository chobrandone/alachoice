import type { Request, Response } from 'express';
import { listQuery, reorderInput } from '@ala/types';
import type { ResourceConfig } from '../config/resources.js';
import { serviceFor } from '../services/resource.service.js';
import { writeAudit } from '../services/audit.service.js';
import { ok, created, noContent } from '../utils/response.js';
import { BadRequest } from '../utils/errors.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Builds public + admin handlers for a single resource config. */
export function makeResourceController(config: ResourceConfig) {
  const service = serviceFor(config);

  return {
    /** GET /  — public: published only. */
    publicList: async (req: Request, res: Response) => {
      const q = listQuery.parse(req.query);
      const { rows, total } = await service.list({
        publishedOnly: config.hasPublished,
        page: q.page,
        pageSize: q.pageSize,
        sort: q.sort,
        order: q.order,
      });
      return ok(res, rows, { page: q.page, pageSize: q.pageSize, total });
    },

    /** GET /:idOrSlug — public. */
    publicGetOne: async (req: Request, res: Response) => {
      const key = req.params.idOrSlug;
      const row =
        config.hasSlug && !UUID_RE.test(key)
          ? await service.getBySlug(key, config.hasPublished)
          : await service.getById(key, config.hasPublished);
      return ok(res, row);
    },

    /** GET / — admin: everything, paginated + searchable. */
    adminList: async (req: Request, res: Response) => {
      const q = listQuery.parse(req.query);
      const { rows, total } = await service.list({
        publishedOnly: false,
        page: q.page,
        pageSize: q.pageSize,
        search: q.search,
        sort: q.sort,
        order: q.order,
      });
      return ok(res, rows, { page: q.page, pageSize: q.pageSize, total });
    },

    /** GET /:id — admin. */
    adminGetOne: async (req: Request, res: Response) => {
      const row = await service.getById(req.params.id);
      return ok(res, row);
    },

    /** POST / — admin. Body already validated by middleware. */
    create: async (req: Request, res: Response) => {
      const row = await service.create(req.body);
      await writeAudit(req, 'create', config.table, row.id, req.body);
      return created(res, row);
    },

    /** PATCH /:id — admin. */
    update: async (req: Request, res: Response) => {
      const row = await service.update(req.params.id, req.body);
      await writeAudit(req, 'update', config.table, row.id, req.body);
      return ok(res, row);
    },

    /** DELETE /:id — admin. */
    remove: async (req: Request, res: Response) => {
      await service.remove(req.params.id);
      await writeAudit(req, 'delete', config.table, req.params.id);
      return noContent(res);
    },

    /** PATCH /reorder — admin. */
    reorder: async (req: Request, res: Response) => {
      if (!config.orderable) throw BadRequest('This resource is not orderable');
      const { items } = reorderInput.parse(req.body);
      await service.reorder(items);
      await writeAudit(req, 'reorder', config.table, null, items);
      return ok(res, { updated: items.length });
    },
  };
}
