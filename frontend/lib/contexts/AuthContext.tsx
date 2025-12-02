'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, type User } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    name: string;
    agreeToTerms: boolean;
    agreeToEmails: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = React.useCallback(async () => {
    try {
      const response = await authApi.getCurrentUser();
      console.log('[AUTH CONTEXT DEBUG] User loaded:', {
        id: response.id,
        email: response.email,
        avatarUrl: response.avatarUrl,
        hasAvatar: !!response.avatarUrl,
      });
      setUser(response);
    } catch (error) {
      console.error('[AUTH CONTEXT DEBUG] Failed to load user:', error);
      // User not authenticated or token expired
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user and token on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      loadUser();
    } else {
      setIsLoading(false);
    }
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setUser(response.user);
    setAccessToken(response.accessToken);
    localStorage.setItem('accessToken', response.accessToken);
  };

  const signup = async (data: {
    email: string;
    password: string;
    name: string;
    agreeToTerms: boolean;
    agreeToEmails: boolean;
  }) => {
    await authApi.signup(data);
    // After signup, login automatically
    await login(data.email, data.password);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore errors during logout
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
  };

  const refreshUser = React.useCallback(async () => {
    setIsLoading(true);
    // Re-read token from localStorage in case it was just set
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
    }
    await loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user && !!accessToken,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
