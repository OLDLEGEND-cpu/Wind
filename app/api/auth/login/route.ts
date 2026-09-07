import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { verifyPassword, signSession, sessionCookieOptions, AUTH_COOKIE } from '@/lib/auth';
import { loginSchema, formatZodError } from '@/lib/validation';
import { handleApiError, HttpError } from '@/lib/apiUtils';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const limit = await checkRateLimit({ key: `login:${ip}`, windowMs: 15 * 60 * 1000, max: 20 });
    if (!limit.allowed) {
      throw new HttpError('Too many login attempts. Please wait and try again.', 429);
    }

    const body = await req.json().catch(() => null);
    if (!body) throw new HttpError('Invalid request body', 400);

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(formatZodError(parsed.error), 422);

    const { email, password } = parsed.data;

    const rows = await query<any[]>(
      'SELECT id, name, email, password_hash, role, status, avatar_color FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      throw new HttpError('Invalid email or password.', 401);
    }

    const user = rows[0];

    if (user.status === 'suspended') {
      await logAudit({
        actorId: user.id,
        actorEmail: email,
        action: 'user.login_blocked_suspended',
        targetType: 'user',
        targetId: user.id,
        ipAddress: ip
      });
      throw new HttpError('This account has been suspended. Contact support.', 403);
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      await logAudit({
        actorEmail: email,
        action: 'user.login_failed',
        targetType: 'user',
        targetId: user.id,
        ipAddress: ip
      });
      throw new HttpError('Invalid email or password.', 401);
    }

    await execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    const token = signSession({ sub: user.id, email: user.email, role: user.role });

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'user.login',
      targetType: 'user',
      targetId: user.id,
      ipAddress: ip
    });

    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatar_color
      }
    });
    res.cookies.set(AUTH_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err) {
    return handleApiError(err);
  }
}
