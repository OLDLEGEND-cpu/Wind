import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query, execute } from '@/lib/db';
import { jsonOk, handleApiError, HttpError } from '@/lib/apiUtils';

// Called by the client when the user clicks "Stop". Persists whatever partial
// text the client had received so the message isn't lost, and marks it stopped.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) throw new HttpError('Not authenticated', 401);

    const convRows = await query<any[]>('SELECT user_id FROM conversations WHERE id = ?', [
      params.id
    ]);
    if (convRows.length === 0) throw new HttpError('Conversation not found', 404);
    if (convRows[0].user_id !== user.id) throw new HttpError('Forbidden', 403);

    const body = await req.json().catch(() => ({}));
    const { messageId, partialContent } = body as { messageId?: string; partialContent?: string };
    if (!messageId) throw new HttpError('messageId is required', 400);

    await execute(
      `UPDATE messages SET content = ?, status = 'stopped'
       WHERE id = ? AND conversation_id = ? AND status = 'streaming'`,
      [partialContent || '', messageId, params.id]
    );

    return jsonOk({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
