import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { query } from '@/lib/db';
import { jsonOk, handleApiError } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 30)));
    const offset = (page - 1) * pageSize;

    let where = 'WHERE 1=1';
    const params: unknown[] = [];
    if (status === 'success' || status === 'error' || status === 'rate_limited') {
      where += ' AND l.status = ?';
      params.push(status);
    }

    const countRows = await query<any[]>(
      `SELECT COUNT(*) as total FROM api_usage_logs l ${where}`,
      params
    );
    const total = Number(countRows[0]?.total || 0);

    const rows = await query<any[]>(
      `SELECT l.id, l.model, l.prompt_tokens, l.completion_tokens, l.latency_ms, l.status,
        l.error_message, l.created_at, u.email as userEmail, u.name as userName
       FROM api_usage_logs l
       LEFT JOIN users u ON u.id = l.user_id
       ${where}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return jsonOk({ logs: rows, total, page, pageSize });
  } catch (err) {
    return handleApiError(err);
  }
}
