// Shared types between frontend and backend

export type UserRole = 'owner' | 'admin' | 'developer' | 'auditor';
export type AuthProvider = 'email' | 'google';
export type SubscriptionTier = 'free' | 'paid';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  authProvider: AuthProvider;
  emailVerified: boolean;
  emailOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  ownerId: string;
  subscriptionTier: SubscriptionTier;
  maxProjects: number;
  maxTeamMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  publicBugTracking: boolean;
  publicFeatureRequests: boolean;
  createdAt: Date;
  updatedAt: Date;
}
