import { NextRequest } from 'next/server';
import { getCurrentUser, AuthUser } from './auth';
import { HttpError } from './apiUtils';

export async function requireAdmin(req: NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser(req);
  if (!user) throw new HttpError('Not authenticated', 401);
  if (user.role !== 'admin') throw new HttpError('Admin access required', 403);
  if (user.status === 'suspended') throw new HttpError('Account suspended', 403);
  return user;
}
