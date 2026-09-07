import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { query, execute } from '@/lib/db';
import { jsonOk, handleApiError, HttpError } from '@/lib/apiUtils';
import { adminUpdateUserSchema, formatZodError } from '@/lib/validation';
import { logAudit } from '@/lib/audit';
import { getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);

    const rows = await query<any[]>(
      `SELECT id, name, email, role, status, avatar_color, created_at, last_login_at
       FROM users WHERE id = ? LIMIT 1`,
      [params.id]
    );
    if (rows.length === 0) throw new HttpError('User not found', 404);

    const conversations = await query<any[]>(
      `SELECT id, title, created_at, updated_at,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = conversations.id) as messageCount
       FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50`,
      [params.id]
    );

    const usage = await query<any[]>(
      `SELECT COUNT(*) as totalRequests,
        SUM(prompt_tokens + completion_tokens) as totalTokens,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
       FROM api_usage_logs WHERE user_id = ?`,
      [params.id]
    );

    const recentAudit = await query<any[]>(
      `SELECT id, action, target_type, target_id, ip_address, created_at
       FROM audit_logs WHERE actor_id = ? ORDER BY created_at DESC LIMIT 20`,
      [params.id]
    );

    return jsonOk({
      user: rows[0],
      conversations,
      usage: usage[0],
      recentAudit
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(req);

    const body = await req.json().catch(() => null);
    if (!body) throw new HttpError('Invalid request body', 400);
    const parsed = adminUpdateUserSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(formatZodError(parsed.error), 422);

    if (params.id === admin.id && parsed.data.role === 'user') {
      throw new HttpError('You cannot remove your own admin role.', 400);
    }
    if (params.id === admin.id && parsed.data.status === 'suspended') {
      throw new HttpError('You cannot suspend your own account.', 400);
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    if (parsed.data.role) {
      fields.push('role = ?');
      values.push(parsed.data.role);
    }
    if (parsed.data.status) {
      fields.push('status = ?');
      values.push(parsed.data.status);
    }
    if (parsed.data.name) {
      fields.push('name = ?');
      values.push(parsed.data.name);
    }

    if (fields.length > 0) {
      values.push(params.id);
      await execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

      await logAudit({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'admin.update_user',
        targetType: 'user',
        targetId: params.id,
        metadata: parsed.data,
        ipAddress: getClientIp(req.headers)
      });
    }

    return jsonOk({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(req);
    if (params.id === admin.id) throw new HttpError('You cannot delete your own account.', 400);

    await execute('DELETE FROM users WHERE id = ?', [params.id]);

    await logAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'admin.delete_user',
      targetType: 'user',
      targetId: params.id,
      ipAddress: getClientIp(req.headers)
    });

    return jsonOk({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
