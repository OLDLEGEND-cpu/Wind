import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, getCurrentUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (user) {
    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'user.logout',
      targetType: 'user',
      targetId: user.id,
      ipAddress: getClientIp(req.headers)
    });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(AUTH_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
