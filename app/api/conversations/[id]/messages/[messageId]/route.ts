import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query, execute } from '@/lib/db';
import { jsonOk, handleApiError, HttpError } from '@/lib/apiUtils';
import { editMessageSchema, formatZodError } from '@/lib/validation';

async function assertOwnership(conversationId: string, userId: string) {
  const rows = await query<any[]>('SELECT user_id FROM conversations WHERE id = ? LIMIT 1', [
    conversationId
  ]);
  if (rows.length === 0) throw new HttpError('Conversation not found', 404);
  if (rows[0].user_id !== userId) throw new HttpError('Forbidden', 403);
}

// Edit a user message: updates content, deletes all subsequent messages so it can be regenerated
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) throw new HttpError('Not authenticated', 401);
    await assertOwnership(params.id, user.id);

    const body = await req.json().catch(() => null);
    if (!body) throw new HttpError('Invalid request body', 400);
    const parsed = editMessageSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(formatZodError(parsed.error), 422);

    const msgRows = await query<any[]>(
      'SELECT id, created_at FROM messages WHERE id = ? AND conversation_id = ?',
      [params.messageId, params.id]
    );
    if (msgRows.length === 0) throw new HttpError('Message not found', 404);

    await execute('UPDATE messages SET content = ?, edited = 1 WHERE id = ?', [
      parsed.data.content,
      params.messageId
    ]);

    // Remove every message after this one (the old assistant reply and anything after)
    await execute(
      'DELETE FROM messages WHERE conversation_id = ? AND created_at > ? AND id != ?',
      [params.id, msgRows[0].created_at, params.messageId]
    );

    return jsonOk({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) throw new HttpError('Not authenticated', 401);
    await assertOwnership(params.id, user.id);

    await execute('DELETE FROM messages WHERE id = ? AND conversation_id = ?', [
      params.messageId,
      params.id
    ]);

    return jsonOk({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
