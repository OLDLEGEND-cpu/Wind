import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { query } from '@/lib/db';
import { jsonOk, handleApiError } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.trim();
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)));
    const offset = (page - 1) * pageSize;

    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (search) {
      where += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role === 'user' || role === 'admin') {
      where += ' AND role = ?';
      params.push(role);
    }
    if (status === 'active' || status === 'suspended') {
      where += ' AND status = ?';
      params.push(status);
    }

    const countRows = await query<any[]>(`SELECT COUNT(*) as total FROM users ${where}`, params);
    const total = Number(countRows[0]?.total || 0);

    const rows = await query<any[]>(
      `SELECT id, name, email, role, status, avatar_color, created_at, last_login_at,
        (SELECT COUNT(*) FROM conversations c WHERE c.user_id = users.id) as conversationCount
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return jsonOk({ users: rows, total, page, pageSize });
  } catch (err) {
    return handleApiError(err);
  }
}
