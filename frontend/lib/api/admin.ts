import { apiClient } from '../api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  authProvider: string;
  emailVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  ownedTenants: Tenant[];
  tenantMemberships: TenantMembership[];
}

export interface Tenant {
  id: string;
  name: string;
  subscriptionTier: string;
  maxProjects: number;
  maxTeamMembers: number;
}

export interface TenantMembership {
  role: string;
  tenant: {
    id: string;
    name: string;
  };
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PlatformStats {
  users: {
    total: number;
    verified: number;
    admins: number;
  };
  tenants: number;
  projects: number;
  tasks: number;
  bugs: number;
  features: number;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  emailVerified?: boolean;
  isAdmin?: boolean;
}

export const adminApi = {
  /**
   * Get all users with pagination
   */
  async getUsers(page: number = 1, limit: number = 50, search?: string): Promise<PaginatedUsers> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    return apiClient.get<PaginatedUsers>(`/api/admin/users?${params}`);
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    return apiClient.get<User>(`/api/admin/users/${userId}`);
  },

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    return apiClient.patch<User>(`/api/admin/users/${userId}`, data);
  },

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete<void>(`/api/admin/users/${userId}`);
  },

  /**
   * Update user's tenant
   */
  async updateUserTenant(
    userId: string,
    tenantId: string,
    data: {
      subscriptionTier?: string;
      maxProjects?: number;
      maxTeamMembers?: number;
    }
  ): Promise<Tenant> {
    return apiClient.patch<Tenant>(`/api/admin/users/${userId}/tenant/${tenantId}`, data);
  },

  /**
   * Get platform statistics
   */
  async getStats(): Promise<PlatformStats> {
    return apiClient.get<PlatformStats>('/api/admin/stats');
  },
};
