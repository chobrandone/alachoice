import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { writeAudit } from '../services/audit.service.js';

/** Returns all settings as a { key: value_json } map. */
async function getSettingsMap() {
  const { data, error } = await supabaseAdmin.from('site_settings').select('key, value_json');
  if (error) throw error;
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) map[row.key] = row.value_json;
  return map;
}

/* ---- Public ---- */
export const settingsPublicRouter = Router();
settingsPublicRouter.get('/', asyncHandler(async (_req, res) => ok(res, await getSettingsMap())));

/* ---- Admin ---- */
const settingUpsert = z.object({ value_json: z.record(z.string(), z.unknown()) });

export const settingsAdminRouter = Router();
settingsAdminRouter.use(requireAdmin);

settingsAdminRouter.get('/', asyncHandler(async (_req, res) => ok(res, await getSettingsMap())));

settingsAdminRouter.put(
  '/:key',
  validate(settingUpsert),
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key: req.params.key, value_json: req.body.value_json }, { onConflict: 'key' })
      .select('*')
      .single();
    if (error) throw error;
    await writeAudit(req, 'update', 'site_settings', data.id, req.body.value_json);
    return ok(res, data);
  }),
);
