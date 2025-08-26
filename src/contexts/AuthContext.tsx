'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  getIdToken: async () => null,
  signOut: async () => {},
});

// Admin privileges are now handled exclusively through Firebase custom claims
// for proper security. No hardcoded email bypasses are permitted. 

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenCache, setTokenCache] = useState<{ token: string; expiry: number } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // Check for admin privileges via Firebase custom claims
        try {
          const idTokenResult = await user.getIdTokenResult();
          setIsAdmin(!!idTokenResult.claims.admin);
        } catch (error) {
          console.error('Error checking admin claims:', error);
          setIsAdmin(false);
        }
        
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Enhanced token management with caching and automatic refresh
  const getIdToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    if (!user) {
      setTokenCache(null);
      return null;
    }

    const now = Date.now();
    
    // Use cached token if still valid and not forcing refresh
    if (!forceRefresh && tokenCache && tokenCache.expiry > now + (5 * 60 * 1000)) {
      return tokenCache.token;
    }

    try {
      const token = await user.getIdToken(forceRefresh);
      
      // Cache the token (Firebase tokens are valid for 1 hour)
      const expiry = now + (50 * 60 * 1000); // 50 minutes for safety margin
      setTokenCache({ token, expiry });
      
      return token;
    } catch (error) {
      console.error('Error getting ID token:', error);
      setTokenCache(null);
      return null;
    }
  }, [user, tokenCache]);

  // Secure sign out that clears all state
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsAdmin(false);
      setTokenCache(null);
      
      // Clear any stored authentication data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authState');
        sessionStorage.clear();
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  const value = { user, isAdmin, loading, getIdToken, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
