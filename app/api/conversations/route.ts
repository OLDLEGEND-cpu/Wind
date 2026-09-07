import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { query, execute } from '@/lib/db';
import { jsonOk, handleApiError, HttpError } from '@/lib/apiUtils';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) throw new HttpError('Not authenticated', 401);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.trim();

    let sql = `SELECT id, title, pinned, archived, model, created_at, updated_at
               FROM conversations WHERE user_id = ? AND archived = 0`;
    const params: unknown[] = [user.id];

    if (search) {
      sql += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY pinned DESC, updated_at DESC LIMIT 200';

    const rows = await query<any[]>(sql, params);
    return jsonOk({ conversations: rows });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) throw new HttpError('Not authenticated', 401);

    const body = await req.json().catch(() => ({}));
    const model = typeof body?.model === 'string' ? body.model : 'gemini-3.6-flash';

    const id = randomUUID();
    await execute('INSERT INTO conversations (id, user_id, model) VALUES (?, ?, ?)', [
      id,
      user.id,
      model
    ]);

    const rows = await query<any[]>(
      'SELECT id, title, pinned, archived, model, created_at, updated_at FROM conversations WHERE id = ?',
      [id]
    );

    return jsonOk({ conversation: rows[0] }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
