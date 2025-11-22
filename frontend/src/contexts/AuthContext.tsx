'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { tokenStorage } from '@/lib/storage/token';
import type { AuthContextType, LoginData, RegisterData, User } from '@/types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!tokenStorage.hasValidToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.validateSession();
      setUser(userData);
    } catch (error) {
      console.error('Failed to validate session:', error);
      tokenStorage.removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (data: LoginData) => {
    setIsLoading(true);
    try {
      const authResponse = await authApi.login(data);
      const userData = await authApi.getUser(authResponse.userId);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await authApi.register(data);
      // After registration, automatically log in
      await login({ email: data.email, password: data.password });
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
