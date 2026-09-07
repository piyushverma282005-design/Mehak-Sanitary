import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/auth';
import { getStoredToken, removeStoredToken, addUnauthorizedListener } from '../api/client';
import { AdminUser } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  checkSession: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const checkSession = useCallback(async () => {
    try {
      if (isMountedRef.current) setIsLoading(true);

      const token = await getStoredToken();
      if (!token) {
        if (isMountedRef.current) setUser(null);
        return;
      }

      const res = await authService.getMe();
      if (res.authenticated && res.user) {
        if (isMountedRef.current) setUser(res.user);
      } else {
        // Token was rejected by the server
        await removeStoredToken();
        if (isMountedRef.current) setUser(null);
      }
    } catch {
      // Network error or 401 on cold start - remove stale/invalid token
      await removeStoredToken();
      if (isMountedRef.current) setUser(null);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();

    // Register global 401 unauthorized listener
    const unsubscribe = addUnauthorizedListener(() => {
      if (isMountedRef.current) {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [checkSession]);

  const login = async (email: string, password: string) => {
    if (isMountedRef.current) setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.user && isMountedRef.current) {
        setUser(res.user);
      } else {
        await checkSession();
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isMountedRef.current) setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      await removeStoredToken();
      if (isMountedRef.current) {
        setUser(null);
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
