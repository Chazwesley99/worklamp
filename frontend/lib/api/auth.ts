import { apiClient } from '../api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  authProvider: 'email' | 'google';
  emailVerified: boolean;
  emailOptIn: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
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
  accessToken: string;
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
  async signup(data: SignupRequest): Promise<{ user: User; message: string }> {
    return apiClient.post<{ user: User; message: string }>('/api/auth/signup', data);
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
  async getCurrentUser(): Promise<User> {
    const user = await apiClient.get<User>('/api/users/me');
    console.log('[AUTH API DEBUG] getCurrentUser response:', {
      id: user.id,
      email: user.email,
      avatarUrl: user.avatarUrl,
      hasAvatar: !!user.avatarUrl,
    });
    return user;
  },

  /**
   * Initiate Google OAuth
   */
  googleLogin() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/google`;
  },
};
