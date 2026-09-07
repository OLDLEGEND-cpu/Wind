import { NextRequest } from 'next/server';
import { query, execute } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { jsonOk, jsonError, handleApiError, HttpError } from '@/lib/apiUtils';
import { logAudit } from '@/lib/audit';
import { getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.email || !body?.newPassword) {
      throw new HttpError('Email and new password are required', 400);
    }

    if (body.newPassword.length < 8) {
      throw new HttpError('Password must be at least 8 characters long', 422);
    }

    const email = String(body.email).toLowerCase().trim();
    const rows = await query<any[]>('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (rows.length === 0) {
      // Return ok to prevent account enumeration
      return jsonOk({ success: true });
    }

    const userId = rows[0].id;
    const newHash = await hashPassword(body.newPassword);
    await execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    const ip = getClientIp(req.headers);
    await logAudit({
      actorId: userId,
      actorEmail: email,
      action: 'user.password_reset',
      targetType: 'user',
      targetId: userId,
      ipAddress: ip
    });

    return jsonOk({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}
