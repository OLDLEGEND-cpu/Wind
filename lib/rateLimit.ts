import { execute, query } from './db';

interface RateLimitOptions {
  key: string; // e.g. `ip:1.2.3.4` or `user:<id>`
  windowMs: number;
  max: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Simple sliding-window rate limiter backed by MySQL.
 * Good enough for moderate traffic without needing Redis.
 */
export async function checkRateLimit({ key, windowMs, max }: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = new Date(now - windowMs);

  await execute('DELETE FROM rate_limit_hits WHERE bucket_key = ? AND created_at < ?', [
    key,
    windowStart
  ]);

  const rows = await query<any[]>(
    'SELECT COUNT(*) as count FROM rate_limit_hits WHERE bucket_key = ? AND created_at >= ?',
    [key, windowStart]
  );
  const count = Number(rows[0]?.count || 0);

  if (count >= max) {
    return { allowed: false, remaining: 0, resetMs: windowMs };
  }

  await execute('INSERT INTO rate_limit_hits (bucket_key) VALUES (?)', [key]);
  return { allowed: true, remaining: Math.max(0, max - count - 1), resetMs: windowMs };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') || 'unknown';
}
