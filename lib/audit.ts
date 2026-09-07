import { randomUUID } from 'crypto';
import { execute } from './db';

interface AuditEntry {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await execute(
      `INSERT INTO audit_logs (id, actor_id, actor_email, action, target_type, target_id, metadata, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        entry.actorId || null,
        entry.actorEmail || null,
        entry.action,
        entry.targetType || null,
        entry.targetId || null,
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        entry.ipAddress || null
      ]
    );
  } catch (err) {
    // Never let audit logging break the request
    console.error('audit log failed', err);
  }
}

interface UsageEntry {
  userId?: string | null;
  conversationId?: string | null;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  latencyMs: number;
  status: 'success' | 'error' | 'rate_limited';
  errorMessage?: string | null;
}

export async function logUsage(entry: UsageEntry): Promise<void> {
  try {
    await execute(
      `INSERT INTO api_usage_logs (id, user_id, conversation_id, model, prompt_tokens, completion_tokens, latency_ms, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        entry.userId || null,
        entry.conversationId || null,
        entry.model,
        entry.promptTokens || 0,
        entry.completionTokens || 0,
        entry.latencyMs,
        entry.status,
        entry.errorMessage || null
      ]
    );
  } catch (err) {
    console.error('usage log failed', err);
  }
}

export function estimateTokens(text: string): number {
  // Rough heuristic: ~4 chars per token
  return Math.ceil(text.length / 4);
}
