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

// --- DEVELOPMENT ONLY ---
// This email will be granted admin privileges automatically for development purposes.
// This is a temporary workaround to bypass service account issues.
// REMOVE THIS BEFORE PRODUCTION.
const DEV_ADMIN_EMAIL = 'baise.thomas@gmail.com'; 

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // --- DEVELOPMENT WORKAROUND ---
        if (user.email === DEV_ADMIN_EMAIL) {
          console.warn("******************************************************************");
          console.warn("*  DEVELOPMENT MODE: User has been granted admin access via email. *");
          console.warn("*  This is a temporary workaround and must be removed for prod.  *");
          console.warn("******************************************************************");
          setIsAdmin(true);
        } else {
          // Standard check for all other users via custom claims
          const idTokenResult = await user.getIdTokenResult();
          setIsAdmin(!!idTokenResult.claims.admin);
        }
        
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
