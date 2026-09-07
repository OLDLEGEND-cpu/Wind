import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { query } from '@/lib/db';
import { jsonOk, handleApiError } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const [userCounts] = await query<any[]>(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END) as newThisWeek
      FROM users
    `);

    const [convCounts] = await query<any[]>(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END) as newThisWeek
      FROM conversations
    `);

    const [msgCounts] = await query<any[]>(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN created_at >= CURDATE() THEN 1 ELSE 0 END) as today
      FROM messages
    `);

    const [usageCounts] = await query<any[]>(`
      SELECT
        COUNT(*) as totalRequests,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors,
        AVG(latency_ms) as avgLatency,
        SUM(prompt_tokens + completion_tokens) as totalTokens
      FROM api_usage_logs
      WHERE created_at >= NOW() - INTERVAL 7 DAY
    `);

    const dailyActivity = await query<any[]>(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM messages
      WHERE created_at >= NOW() - INTERVAL 14 DAY
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    return jsonOk({
      users: userCounts,
      conversations: convCounts,
      messages: msgCounts,
      usage: usageCounts,
      dailyActivity
    });
  } catch (err) {
    return handleApiError(err);
  }
}
