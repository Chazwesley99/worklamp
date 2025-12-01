import { apiClient } from '../api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  authProvider: 'email' | 'google';
  emailVerified: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  agreeToTerms: boolean;
  agreeToEmails: boolean;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export const authApi = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/auth/login', data);
  },

  /**
   * Sign up with email and password
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/auth/signup', data);
  },

  /**
   * Logout current user
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/api/auth/logout');
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/api/users/me');
  },

  /**
   * Initiate Google OAuth
   */
  googleLogin() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/google`;
  },
};
