import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { query, execute } from '@/lib/db';
import { hashPassword, signSession, sessionCookieOptions, AUTH_COOKIE } from '@/lib/auth';
import { registerSchema, formatZodError } from '@/lib/validation';
import { handleApiError, jsonError, HttpError } from '@/lib/apiUtils';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { logAudit } from '@/lib/audit';

const AVATAR_COLORS = ['#6366f1', '#0891b2', '#ea580c', '#059669', '#db2777', '#7c3aed'];

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const limit = await checkRateLimit({ key: `register:${ip}`, windowMs: 60 * 60 * 1000, max: 10 });
    if (!limit.allowed) {
      throw new HttpError('Too many registration attempts. Please try again later.', 429);
    }

    const body = await req.json().catch(() => null);
    if (!body) throw new HttpError('Invalid request body', 400);

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(formatZodError(parsed.error), 422);

    const { name, email, password } = parsed.data;

    const rows = await query<any[]>('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (rows.length > 0) {
      throw new HttpError('An account with this email already exists.', 409);
    }

    const settingsRows = await query<any[]>(
      "SELECT value FROM system_settings WHERE `key` = 'signup_enabled' LIMIT 1"
    );
    if (settingsRows.length > 0) {
      const enabled = JSON.parse(settingsRows[0].value);
      if (enabled === false) {
        throw new HttpError('Sign-ups are currently disabled.', 403);
      }
    }

    const id = randomUUID();
    const passwordHash = await hashPassword(password);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    await execute(
      'INSERT INTO users (id, name, email, password_hash, avatar_color) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, passwordHash, avatarColor]
    );
    await execute('INSERT INTO user_settings (user_id) VALUES (?)', [id]);

    const token = signSession({ sub: id, email, role: 'user' });

    await logAudit({
      actorId: id,
      actorEmail: email,
      action: 'user.register',
      targetType: 'user',
      targetId: id,
      ipAddress: ip
    });

    const res = NextResponse.json({
      user: { id, name, email, role: 'user', avatarColor }
    });
    res.cookies.set(AUTH_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err) {
    return handleApiError(err);
  }
}
