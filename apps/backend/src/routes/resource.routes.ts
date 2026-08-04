import { Router } from 'express';
import { resources } from '../config/resources.js';
import { makeResourceController } from '../controllers/resource.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Public read router: for every publicRead resource,
 *   GET /{path}          → published list
 *   GET /{path}/:idOrSlug → published single
 */
export function buildPublicResourceRouter(): Router {
  const router = Router();
  for (const config of Object.values(resources)) {
    if (!config.publicRead) continue;
    const c = makeResourceController(config);
    router.get(`/${config.path}`, asyncHandler(c.publicList));
    router.get(`/${config.path}/:idOrSlug`, asyncHandler(c.publicGetOne));
  }
  return router;
}

/**
 * Admin CRUD router: for every resource,
 *   GET    /{path}          list (search/paginate)
 *   POST   /{path}          create
 *   PATCH  /{path}/reorder  reorder (orderable only)
 *   GET    /{path}/:id       read one
 *   PATCH  /{path}/:id       update
 *   DELETE /{path}/:id       delete
 */
export function buildAdminResourceRouter(): Router {
  const router = Router();
  router.use(requireAdmin);

  for (const config of Object.values(resources)) {
    const c = makeResourceController(config);
    const p = `/${config.path}`;

    router.get(p, asyncHandler(c.adminList));
    router.post(p, validate(config.createSchema), asyncHandler(c.create));

    if (config.orderable) {
      router.patch(`${p}/reorder`, asyncHandler(c.reorder));
    }

    router.get(`${p}/:id`, asyncHandler(c.adminGetOne));
    router.patch(`${p}/:id`, validate(config.updateSchema), asyncHandler(c.update));
    router.delete(`${p}/:id`, asyncHandler(c.remove));
  }
  return router;
}
