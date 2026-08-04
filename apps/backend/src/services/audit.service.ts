import type { Request } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';

type Action = 'create' | 'update' | 'delete' | 'reorder' | 'export';

/** Fire-and-forget audit trail; never blocks the request on failure. */
export async function writeAudit(
  req: Request,
  action: Action,
  entity: string,
  entityId: string | null = null,
  diff?: unknown,
): Promise<void> {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      admin_user_id: req.admin?.id ?? null,
      action,
      entity,
      entity_id: entityId,
      diff_json: diff ?? null,
      ip: (req.headers['x-forwarded-for'] as string) ?? req.socket.remoteAddress ?? null,
    });
  } catch (err) {
    console.error('[audit] failed to record', entity, action, err);
  }
}
