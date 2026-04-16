'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export type Role = 'admin' | 'member' | 'guest';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAdmin: boolean; // Retained for backwards compatibility
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAdmin: false,
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        const allowlist = parseAllowlist(process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST);
        const email = user.email?.toLowerCase();

        // UI admin gating: allowlist OR custom claims (backwards compatible)
        const idTokenResult = await user.getIdTokenResult();
        const isAllowlisted = email ? allowlist.has(email) : false;
        const isClaimAdmin = !!idTokenResult.claims.admin;
        
        const resolvedIsAdmin = isAllowlisted || isClaimAdmin;
        setIsAdmin(resolvedIsAdmin);
        
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
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, role, isAdmin, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
