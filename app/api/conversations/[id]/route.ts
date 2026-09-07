import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query, execute } from '@/lib/db';
import { jsonOk, handleApiError, HttpError } from '@/lib/apiUtils';
import { renameConversationSchema } from '@/lib/validation';
import { logAudit } from '@/lib/audit';

async function assertOwnership(conversationId: string, userId: string) {
  const rows = await query<any[]>('SELECT id, user_id FROM conversations WHERE id = ? LIMIT 1', [
    conversationId
  ]);
  if (rows.length === 0) throw new HttpError('Conversation not found', 404);
  if (rows[0].user_id !== userId) throw new HttpError('Forbidden', 403);
  return rows[0];
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) throw new HttpError('Not authenticated', 401);

    await assertOwnership(params.id, user.id);

    const conv = await query<any[]>(
      'SELECT id, title, pinned, archived, model, created_at, updated_at FROM conversations WHERE id = ?',
      [params.id]
    );
    const msgRows = await query<any[]>(
      `SELECT id, role, content, status, error_message, edited, attachment, created_at
       FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`,
      [params.id]
    );
    const messages = msgRows.map((m) => {
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

    return jsonOk({ conversation: conv[0], messages });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) throw new HttpError('Not authenticated', 401);

    await assertOwnership(params.id, user.id);

    const body = await req.json().catch(() => ({}));

    if (typeof body.title === 'string') {
      const parsed = renameConversationSchema.safeParse({ title: body.title });
      if (!parsed.success) throw new HttpError('Invalid title', 422);
      await execute('UPDATE conversations SET title = ? WHERE id = ?', [
        parsed.data.title,
        params.id
      ]);
    }
    if (typeof body.model === 'string' && body.model.trim()) {
      await execute('UPDATE conversations SET model = ? WHERE id = ?', [
        body.model.trim(),
        params.id
      ]);
    }
    if (typeof body.pinned === 'boolean') {
      await execute('UPDATE conversations SET pinned = ? WHERE id = ?', [
        body.pinned ? 1 : 0,
        params.id
      ]);
    }
    if (typeof body.archived === 'boolean') {
      await execute('UPDATE conversations SET archived = ? WHERE id = ?', [
        body.archived ? 1 : 0,
        params.id
      ]);
    }

    return jsonOk({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) throw new HttpError('Not authenticated', 401);

    await assertOwnership(params.id, user.id);
    await execute('DELETE FROM conversations WHERE id = ?', [params.id]);

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'conversation.delete',
      targetType: 'conversation',
      targetId: params.id
    });

    return jsonOk({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
