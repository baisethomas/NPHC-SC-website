'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
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
        setIsAdmin(isAllowlisted || isClaimAdmin);
        
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, isAdmin, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
