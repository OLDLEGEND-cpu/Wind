import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { query } from './db';

export const AUTH_COOKIE = 'wind_session';

export interface SessionPayload {
  sub: string; // user id
  email: string;
  role: 'user' | 'admin';
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  avatar_color: string;
  created_at: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, getSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d'
  });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookie) return cookie;
  const header = req.headers.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifySession(token);
}

export async function getCurrentUser(req: NextRequest): Promise<AuthUser | null> {
  const session = await getSessionFromRequest(req);
  if (!session) return null;
  const rows = await query<any[]>(
    'SELECT id, name, email, role, status, avatar_color, created_at FROM users WHERE id = ? LIMIT 1',
    [session.sub]
  );
  if (rows.length === 0) return null;
  return rows[0] as AuthUser;
}

// For server components (reads cookie directly)
export async function getServerUser(): Promise<AuthUser | null> {
  const store = cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const session = verifySession(token);
  if (!session) return null;
  const rows = await query<any[]>(
    'SELECT id, name, email, role, status, avatar_color, created_at FROM users WHERE id = ? LIMIT 1',
    [session.sub]
  );
  if (rows.length === 0) return null;
  return rows[0] as AuthUser;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  };
}
