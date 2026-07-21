import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { isAdminUser, type AuthzUser } from '@/lib/authz';
import { withRoles } from '@/lib/authz-v2';
import { getMemberAccessRecord, isApprovedActiveMember } from '@/lib/member-access';
import { hasPermission, type Permission, type Role } from '@/lib/roles';

const SESSION_COOKIE = 'nphc_session';

export type SessionResult =
  | { ok: true; user: AuthzUser }
  | { ok: false; error: 'Unauthorized' };

type AdminSessionResult =
  | { ok: true; user: AuthzUser }
  | { ok: false; error: 'Unauthorized' | 'Admin access required' };

/**
 * Verifies the Firebase session cookie minted by /api/auth/session.
 */
export async function requireSession(): Promise<SessionResult> {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionCookie || !adminAuth) {
    return { ok: false, error: 'Unauthorized' };
  }

  try {
    const user = (await adminAuth.verifySessionCookie(sessionCookie, true)) as AuthzUser;
    return { ok: true, user };
  } catch {
    return { ok: false, error: 'Unauthorized' };
  }
}

/**
 * Server Actions must use this before privileged Admin SDK operations.
 */
export async function requireAdminSession(): Promise<AdminSessionResult> {
  const session = await requireSession();
  if (!session.ok) return session;

  const { user } = session;
  if (!isAdminUser(user)) {
    return { ok: false, error: 'Admin access required' };
  }

  return { ok: true, user };
}

export async function requirePermissionSession(
  permission: Permission
): Promise<
  | { ok: true; user: AuthzUser & { roles: Role[] } }
  | { ok: false; error: 'Unauthorized' | 'Insufficient permissions' }
> {
  const session = await requireSession();
  if (!session.ok) return session;

  // Shares role resolution with the API-route guards in authz-v2 so both
  // auth paths agree on legacy-claim and allowlist bridging.
  const user = withRoles(session.user);
  if (!hasPermission(user.roles, permission)) {
    return { ok: false, error: 'Insufficient permissions' };
  }

  return { ok: true, user };
}

export async function requireActiveMemberSession(): Promise<
  | { ok: true; user: AuthzUser }
  | { ok: false; error: 'Unauthorized' | 'Approved active membership required' }
> {
  const session = await requireSession();
  if (!session.ok) return session;

  if (isAdminUser(session.user)) {
    return session;
  }

  const member = await getMemberAccessRecord(session.user.uid);
  if (!isApprovedActiveMember(member)) {
    return { ok: false, error: 'Approved active membership required' };
  }

  return session;
}

export const sessionCookieName = SESSION_COOKIE;
