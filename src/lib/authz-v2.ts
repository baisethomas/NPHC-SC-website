import type { NextRequest } from 'next/server';
import type { AuthzUser } from '@/lib/authz';
import { isAdminUser, requireUser } from '@/lib/authz';
import {
  hasPermission,
  hasRole,
  normalizeRoles,
  type Permission,
  type Role,
} from '@/lib/roles';

export type UserWithRoles = AuthzUser & { roles: Role[] };

type AuthorizationFailure =
  | { ok: false; status: 401; error: 'Unauthorized' | 'Invalid token' }
  | { ok: false; status: 403; error: 'Insufficient permissions' };

export function getRolesFromClaims(claims: Record<string, unknown>): Role[] {
  const claimedRoles = normalizeRoles(claims.roles);
  if (claimedRoles.length > 0) return claimedRoles;

  // Compatibility bridge; remove after the claims migration completes.
  if (claims.admin === true) return ['admin'];
  return ['visitor'];
}

export function withRoles(user: AuthzUser): UserWithRoles {
  const roles = getRolesFromClaims(user as Record<string, unknown>);
  return {
    ...user,
    roles: isAdminUser(user) && roles.includes('visitor') ? ['admin'] : roles,
  };
}

export async function requireAnyRole(
  request: NextRequest,
  requiredRoles: readonly Role[]
): Promise<{ ok: true; user: UserWithRoles } | AuthorizationFailure> {
  const result = await requireUser(request);
  if (!result.ok) return result;

  const user = withRoles(result.user);
  if (!requiredRoles.some((role) => hasRole(user.roles, role))) {
    return { ok: false, status: 403, error: 'Insufficient permissions' };
  }

  return { ok: true, user };
}

export async function requirePermission(
  request: NextRequest,
  permission: Permission
): Promise<{ ok: true; user: UserWithRoles } | AuthorizationFailure> {
  const result = await requireUser(request);
  if (!result.ok) return result;

  const user = withRoles(result.user);
  if (!hasPermission(user.roles, permission)) {
    return { ok: false, status: 403, error: 'Insufficient permissions' };
  }

  return { ok: true, user };
}
