import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { query } from '@/lib/db';
import { jsonOk, handleApiError } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action')?.trim();
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 30)));
    const offset = (page - 1) * pageSize;

    let where = 'WHERE 1=1';
    const params: unknown[] = [];
    if (action) {
      where += ' AND action LIKE ?';
      params.push(`%${action}%`);
    }

    const countRows = await query<any[]>(`SELECT COUNT(*) as total FROM audit_logs ${where}`, params);
    const total = Number(countRows[0]?.total || 0);

    const rows = await query<any[]>(
      `SELECT id, actor_id, actor_email, action, target_type, target_id, metadata, ip_address, created_at
       FROM audit_logs ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return jsonOk({ logs: rows, total, page, pageSize });
  } catch (err) {
    return handleApiError(err);
  }
}
