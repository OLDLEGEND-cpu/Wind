import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { query, execute } from '@/lib/db';
import { jsonOk, handleApiError, HttpError } from '@/lib/apiUtils';
import { adminSettingsSchema } from '@/lib/validation';
import { logAudit } from '@/lib/audit';
import { getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const rows = await query<any[]>('SELECT `key`, value, updated_at FROM system_settings');
    const settings: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }
    return jsonOk({ settings, raw: rows });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);

    const body = await req.json().catch(() => null);
    if (!body) throw new HttpError('Invalid request body', 400);
    const parsed = adminSettingsSchema.safeParse(body);
    if (!parsed.success) throw new HttpError('Invalid settings payload', 422);

    await execute(
      `INSERT INTO system_settings (\`key\`, value, updated_by) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value), updated_by = VALUES(updated_by)`,
      [parsed.data.key, JSON.stringify(parsed.data.value), admin.id]
    );

    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'admin.update_system_setting',
      targetType: 'system_setting',
      targetId: parsed.data.key,
      metadata: { value: parsed.data.value },
      ipAddress: getClientIp(req.headers)
    });

    return jsonOk({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
