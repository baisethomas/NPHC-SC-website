'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onIdTokenChanged, User } from 'firebase/auth';
import {
  hasPermission as roleHasPermission,
  hasRole as roleHasRole,
  normalizeRoles,
  type Permission,
  type Role as RBACRole,
} from '@/lib/roles';

export type Role = 'admin' | 'member' | 'guest';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  roles: RBACRole[];
  isAdmin: boolean; // Retained for backwards compatibility
  membershipApproved: boolean;
  hasPermission(permission: Permission): boolean;
  hasRole(role: RBACRole): boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  roles: [],
  isAdmin: false,
  membershipApproved: false,
  hasPermission: () => false,
  hasRole: () => false,
  loading: true,
});

function parseAllowlist(value: string | undefined): Set<string> {
  const raw = value ?? '';
  const emails = raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return new Set(emails);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<RBACRole[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [membershipApproved, setMembershipApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        const allowlist = parseAllowlist(process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST);
        const email = user.email?.toLowerCase();

        // UI admin gating: allowlist OR custom claims (backwards compatible)
        const idTokenResult = await user.getIdTokenResult();
        const isAllowlisted = email ? allowlist.has(email) : false;
        const isClaimAdmin = !!idTokenResult.claims.admin;
        const claimedRoles = normalizeRoles(idTokenResult.claims.roles);
        const resolvedRoles: RBACRole[] =
          claimedRoles.length > 0
            ? claimedRoles
            : isAllowlisted || isClaimAdmin
              ? ['admin']
              : ['visitor'];
        const resolvedIsAdmin =
          resolvedRoles.includes('super_admin') || resolvedRoles.includes('admin');
        setIsAdmin(resolvedIsAdmin);
        setRoles(resolvedRoles);
        const approved = await syncSession(user);
        setMembershipApproved(approved || resolvedIsAdmin);
        
        // Explicit Role Tiering
        if (resolvedIsAdmin) {
          setRole('admin');
        } else {
          // Phase 1: Any authenticated non-admin is considered a 'member'.
          // Phase 2: This will be dynamically evaluated against a 'members' Firestore collection.
          setRole('member');
        }
        
      } else {
        setUser(null);
        setRole('guest');
        setRoles([]);
        setIsAdmin(false);
        setMembershipApproved(false);
        await clearAdminSession();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    role,
    roles,
    isAdmin,
    membershipApproved,
    hasPermission: (permission: Permission) => roleHasPermission(roles, permission),
    hasRole: (requestedRole: RBACRole) => roleHasRole(roles, requestedRole),
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

async function syncSession(user: User): Promise<boolean> {
  const token = await user.getIdToken();
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'same-origin',
  });
  if (!response.ok) return false;
  const payload = (await response.json()) as { membershipApproved?: boolean };
  return payload.membershipApproved === true;
}

async function clearAdminSession() {
  await fetch('/api/auth/session', {
    method: 'DELETE',
    credentials: 'same-origin',
  });
}

export const useAuth = () => {
  return useContext(AuthContext);
};
