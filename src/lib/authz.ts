import type { NextRequest } from 'next/server';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { verifyIdToken } from '@/lib/firebase-admin';
 
function getBearerToken(request: NextRequest): string | null {
  // NextRequest headers are case-insensitive, but we standardize on 'authorization'.
  const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}
 
function parseAllowlist(envValue: string | undefined): Set<string> {
  const raw = envValue ?? '';
  const emails = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return new Set(emails);
}
 
export type AuthzUser = DecodedIdToken & {
  // Firebase Admin's DecodedIdToken includes email in practice (if available),
  // but its typings vary; we normalize it as optional.
  email?: string;
  admin?: boolean;
};
 
export function isAdminUser(user: AuthzUser): boolean {
  const allowlist = parseAllowlist(process.env.ADMIN_EMAIL_ALLOWLIST);
  const email = user.email?.toLowerCase();
  return (email ? allowlist.has(email) : false) || user.admin === true;
}

export async function requireUser(request: NextRequest): Promise<
  | { ok: true; user: AuthzUser }
  | { ok: false; status: 401; error: 'Unauthorized' | 'Invalid token' }
> {
  const token = getBearerToken(request);
  if (!token) return { ok: false, status: 401, error: 'Unauthorized' };
 
  const decoded = (await verifyIdToken(token)) as AuthzUser | null;
  if (!decoded) return { ok: false, status: 401, error: 'Invalid token' };
 
  return { ok: true, user: decoded };
}
 
export async function requireAdmin(request: NextRequest): Promise<
  | { ok: true; user: AuthzUser; isAdmin: true }
  | { ok: false; status: 401; error: 'Unauthorized' | 'Invalid token' }
  | { ok: false; status: 403; error: 'Admin access required' }
> {
  const userResult = await requireUser(request);
  if (!userResult.ok) return userResult;

  if (!isAdminUser(userResult.user)) return { ok: false, status: 403, error: 'Admin access required' };
 
  return { ok: true, user: userResult.user, isAdmin: true };
}
