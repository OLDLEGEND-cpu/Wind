import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { query, execute } from '@/lib/db';
import { streamGemini, buildHistory, generateConversationTitle } from '@/lib/gemini';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { logUsage, estimateTokens } from '@/lib/audit';
import { jsonError } from '@/lib/apiUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface StreamBody {
  conversationId: string;
  mode: 'send' | 'regenerate';
  content?: string; // required for 'send'
  attachment?: {
    name: string;
    mimeType: string;
    data: string;
    size?: number;
  } | null;
  model?: string;
}

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return jsonError('Not authenticated', 401);

  const body = (await req.json().catch(() => null)) as StreamBody | null;
  if (!body?.conversationId || !body?.mode) {
    return jsonError('conversationId and mode are required', 400);
  }
  if (body.mode === 'send' && (!body.content || !body.content.trim()) && !body.attachment) {
    return jsonError('content or attachment is required to send a message', 400);
  }

  const convRows = await query<any[]>(
    'SELECT id, user_id, model, title FROM conversations WHERE id = ? LIMIT 1',
    [body.conversationId]
  );
  if (convRows.length === 0) return jsonError('Conversation not found', 404);
  if (convRows[0].user_id !== user.id) return jsonError('Forbidden', 403);
  const conversation = convRows[0];

  const selectedModel = body.model || conversation.model || 'gemini-3.6-flash';
  if (body.model && body.model !== conversation.model) {
    await execute('UPDATE conversations SET model = ? WHERE id = ?', [body.model, body.conversationId]);
  }

  const ip = getClientIp(req.headers);
  const perUserLimit = await checkRateLimit({
    key: `gemini:user:${user.id}`,
    windowMs: 60 * 1000,
    max: 20
  });
  if (!perUserLimit.allowed) {
    return jsonError('You are sending messages too quickly. Please slow down.', 429);
  }
  const perIpLimit = await checkRateLimit({ key: `gemini:ip:${ip}`, windowMs: 60 * 1000, max: 40 });
  if (!perIpLimit.allowed) {
    return jsonError('Rate limit exceeded. Please try again shortly.', 429);
  }

  const settingsRows = await query<any[]>(
    'SELECT temperature, custom_instructions FROM user_settings WHERE user_id = ? LIMIT 1',
    [user.id]
  );
  const temperature = settingsRows[0] ? Number(settingsRows[0].temperature) : 0.7;
  const customInstructions = settingsRows[0]?.custom_instructions || null;

  // Load existing history
  let historyRows = await query<any[]>(
    `SELECT id, role, content, attachment FROM messages
     WHERE conversation_id = ? AND status = 'complete'
     ORDER BY created_at ASC`,
    [body.conversationId]
  );

  let promptText = '';
  let activeAttachment = body.attachment || null;
  let isFirstMessage = false;

  if (body.mode === 'send') {
    promptText = (body.content || '').trim();
    if (!promptText && activeAttachment) {
      promptText = `Please review and analyze this attached ${activeAttachment.mimeType.startsWith('image/') ? 'image' : 'file'}: ${activeAttachment.name}`;
    }
    const userMsgId = randomUUID();
    const attachmentJson = activeAttachment ? JSON.stringify(activeAttachment) : null;
    await execute(
      'INSERT INTO messages (id, conversation_id, role, content, status, attachment) VALUES (?, ?, ?, ?, ?, ?)',
      [userMsgId, body.conversationId, 'user', promptText, 'complete', attachmentJson]
    );
    isFirstMessage = historyRows.length === 0;
  } else {
    // Regenerate: drop the last assistant message (if any), reuse the last user message as prompt & attachment
    const lastAssistant = [...historyRows].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant) {
      await execute('DELETE FROM messages WHERE id = ?', [lastAssistant.id]);
      historyRows = historyRows.filter((m) => m.id !== lastAssistant.id);
    }
    const lastUser = [...historyRows].reverse().find((m) => m.role === 'user');
    if (!lastUser) {
      return jsonError('Nothing to regenerate', 400);
    }
    promptText = lastUser.content;
    if (lastUser.attachment) {
      try {
        activeAttachment = typeof lastUser.attachment === 'string' ? JSON.parse(lastUser.attachment) : lastUser.attachment;
      } catch {
        activeAttachment = null;
      }
    }
    historyRows = historyRows.filter((m) => m.id !== lastUser.id);
  }

  const geminiHistory = buildHistory(
    historyRows.map((m) => ({ role: m.role, content: m.content }))
  );

  const assistantMsgId = randomUUID();
  await execute(
    'INSERT INTO messages (id, conversation_id, role, content, status) VALUES (?, ?, ?, ?, ?)',
    [assistantMsgId, body.conversationId, 'assistant', '', 'streaming']
  );
  await execute('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [body.conversationId]);

  const encoder = new TextEncoder();
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';
      let errored = false;

      controller.enqueue(encoder.encode(sse('start', { messageId: assistantMsgId })));

      try {
        const gen = streamGemini({
          history: geminiHistory,
          prompt: promptText,
          attachment: activeAttachment,
          model: selectedModel,
          temperature,
          customInstructions
        });

        for await (const chunk of gen) {
          fullText += chunk;
          controller.enqueue(encoder.encode(sse('chunk', { text: chunk })));
        }
      } catch (err: any) {
        errored = true;
        const message = err?.message || 'The AI service encountered an error.';
        controller.enqueue(encoder.encode(sse('error', { message })));
        await execute('UPDATE messages SET status = ?, error_message = ? WHERE id = ?', [
          'error',
          message.slice(0, 500),
          assistantMsgId
        ]);
        await logUsage({
          userId: user.id,
          conversationId: body.conversationId,
          model: selectedModel,
          latencyMs: Date.now() - startTime,
          status: 'error',
          errorMessage: message.slice(0, 500)
        });
      }

      if (!errored) {
        await execute('UPDATE messages SET content = ?, status = ? WHERE id = ?', [
          fullText,
          'complete',
          assistantMsgId
        ]);
        await logUsage({
          userId: user.id,
          conversationId: body.conversationId,
          model: selectedModel,
          promptTokens: estimateTokens(promptText),
          completionTokens: estimateTokens(fullText),
          latencyMs: Date.now() - startTime,
          status: 'success'
        });

        if (isFirstMessage) {
          const title = await generateConversationTitle(promptText);
          await execute('UPDATE conversations SET title = ? WHERE id = ?', [
            title,
            body.conversationId
          ]);
          controller.enqueue(encoder.encode(sse('title', { title })));
        }
      }

      controller.enqueue(encoder.encode(sse('done', { messageId: assistantMsgId })));
      controller.close();
    },
    async cancel() {
      // Client disconnected / stopped generation: persist what we have so far
      const rows = await query<any[]>('SELECT content, status FROM messages WHERE id = ?', [
        assistantMsgId
      ]);
      if (rows[0]?.status === 'streaming') {
        await execute('UPDATE messages SET status = ? WHERE id = ?', ['stopped', assistantMsgId]);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
