import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/adminGuard';
import { query } from '@/lib/db';
import { jsonOk, handleApiError } from '@/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const byModel = await query<any[]>(`
      SELECT model, COUNT(*) as requests,
        SUM(prompt_tokens) as promptTokens,
        SUM(completion_tokens) as completionTokens,
        AVG(latency_ms) as avgLatency,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
      FROM api_usage_logs
      GROUP BY model
      ORDER BY requests DESC
    `);

    const daily = await query<any[]>(`
      SELECT DATE(created_at) as date,
        COUNT(*) as requests,
        SUM(prompt_tokens + completion_tokens) as tokens,
        AVG(latency_ms) as avgLatency,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
      FROM api_usage_logs
      WHERE created_at >= NOW() - INTERVAL 30 DAY
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    const topUsers = await query<any[]>(`
      SELECT u.id, u.name, u.email, COUNT(*) as requests,
        SUM(l.prompt_tokens + l.completion_tokens) as tokens
      FROM api_usage_logs l
      JOIN users u ON u.id = l.user_id
      WHERE l.created_at >= NOW() - INTERVAL 30 DAY
      GROUP BY u.id, u.name, u.email
      ORDER BY requests DESC
      LIMIT 10
    `);

    const recentErrors = await query<any[]>(`
      SELECT l.id, l.model, l.error_message, l.created_at, u.email as userEmail
      FROM api_usage_logs l
      LEFT JOIN users u ON u.id = l.user_id
      WHERE l.status = 'error'
      ORDER BY l.created_at DESC
      LIMIT 20
    `);

    return jsonOk({ byModel, daily, topUsers, recentErrors });
  } catch (err) {
    return handleApiError(err);
  }
}
