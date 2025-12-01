'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, type User } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { user } = await authApi.getCurrentUser();
      setUser(user);
    } catch (error) {
      // User not authenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { user } = await authApi.login({ email, password });
    setUser(user);
  };

  const signup = async (data: {
    email: string;
    password: string;
    name: string;
    agreeToTerms: boolean;
    agreeToEmails: boolean;
  }) => {
    const { user } = await authApi.signup(data);
    setUser(user);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
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
