import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { query, execute } from '@/lib/db';
import { jsonOk, handleApiError, HttpError } from '@/lib/apiUtils';
import { createMessageSchema, formatZodError } from '@/lib/validation';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) throw new HttpError('Not authenticated', 401);

    const convRows = await query<any[]>('SELECT user_id FROM conversations WHERE id = ?', [
      params.id
    ]);
    if (convRows.length === 0) throw new HttpError('Conversation not found', 404);
    if (convRows[0].user_id !== user.id) throw new HttpError('Forbidden', 403);

    const rows = await query<any[]>(
      `SELECT id, role, content, status, error_message, edited, attachment, created_at
       FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`,
      [params.id]
    );
    const messages = rows.map((m) => {
      let attachment = null;
      if (m.attachment) {
        try {
          attachment = typeof m.attachment === 'string' ? JSON.parse(m.attachment) : m.attachment;
        } catch {
          attachment = null;
        }
      }
      return { ...m, attachment };
    });
    return jsonOk({ messages });
  } catch (err) {
    return handleApiError(err);
  }
}

// Creates a user message only (assistant reply is generated via /api/gemini/stream)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) throw new HttpError('Not authenticated', 401);

    const convRows = await query<any[]>('SELECT user_id FROM conversations WHERE id = ?', [
      params.id
    ]);
    if (convRows.length === 0) throw new HttpError('Conversation not found', 404);
    if (convRows[0].user_id !== user.id) throw new HttpError('Forbidden', 403);

    const body = await req.json().catch(() => null);
    if (!body) throw new HttpError('Invalid request body', 400);

    const parsed = createMessageSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(formatZodError(parsed.error), 422);

    const id = randomUUID();
    await execute(
      'INSERT INTO messages (id, conversation_id, role, content, status) VALUES (?, ?, ?, ?, ?)',
      [id, params.id, 'user', parsed.data.content, 'complete']
    );
    await execute('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [params.id]);

    const rows = await query<any[]>('SELECT id, role, content, status, created_at FROM messages WHERE id = ?', [
      id
    ]);

    return jsonOk({ message: rows[0] }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
