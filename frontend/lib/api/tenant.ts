import { apiClient } from '../api';

export interface Tenant {
  id: string;
  name: string;
  subscriptionTier: 'free' | 'paid';
  maxProjects: number;
  maxTeamMembers: number;
  owner: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
  projectCount: number;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TenantMember {
  id: string;
  role: 'owner' | 'admin' | 'developer' | 'auditor';
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
  createdAt: string;
}

export interface InviteUserRequest {
  email: string;
  role: 'admin' | 'developer' | 'auditor';
}

export interface UpdateTenantRequest {
  name: string;
}

export interface UpdateMemberRoleRequest {
  role: 'admin' | 'developer' | 'auditor';
}

export const tenantApi = {
  /**
   * Get current tenant information
   */
  async getCurrentTenant(): Promise<Tenant> {
    return apiClient.get<Tenant>('/api/tenants/me');
  },

  /**
   * Update tenant settings
   */
  async updateTenant(data: UpdateTenantRequest): Promise<Tenant> {
    return apiClient.patch<Tenant>('/api/tenants/me', data);
  },

  /**
   * Get tenant members
   */
  async getTenantMembers(): Promise<{ members: TenantMember[] }> {
    return apiClient.get<{ members: TenantMember[] }>('/api/tenants/me/members');
  },

  /**
   * Invite user to tenant
   */
  async inviteUser(data: InviteUserRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/api/tenants/me/invite', data);
  },

  /**
   * Remove member from tenant
   */
  async removeMember(userId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      `/api/tenants/members/${userId}`
    );
  },

  /**
   * Update member role
   */
  async updateMemberRole(userId: string, data: UpdateMemberRoleRequest): Promise<TenantMember> {
    return apiClient.patch<TenantMember>(`/api/tenants/members/${userId}/role`, data);
  },
};
