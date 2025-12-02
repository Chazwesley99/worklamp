import { apiClient as api } from '../api';

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  estimatedCompletionDate: string;
  actualCompletionDate?: string;
  status: 'planned' | 'in-progress' | 'completed';
  isLocked: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  changeOrders?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export interface CreateMilestoneInput {
  name: string;
  description?: string;
  estimatedCompletionDate: string;
  status?: 'planned' | 'in-progress' | 'completed';
  order?: number;
}

export interface UpdateMilestoneInput {
  name?: string;
  description?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  status?: 'planned' | 'in-progress' | 'completed';
  order?: number;
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  milestoneId: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdById: string;
  createdAt: string;
  updatedAt: string;
  milestone?: {
    id: string;
    name: string;
    isLocked: boolean;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateChangeOrderInput {
  milestoneId: string;
  title: string;
  description: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface UpdateChangeOrderInput {
  title?: string;
  description?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export const milestoneApi = {
  // Milestone endpoints
  getMilestones: async (projectId: string): Promise<Milestone[]> => {
    const response = await api.get<{ milestones: Milestone[] }>(
      `/api/projects/${projectId}/milestones`
    );
    return response.milestones;
  },

  createMilestone: async (projectId: string, data: CreateMilestoneInput): Promise<Milestone> => {
    const response = await api.post<{ milestone: Milestone }>(
      `/api/projects/${projectId}/milestones`,
      data
    );
    return response.milestone;
  },

  updateMilestone: async (milestoneId: string, data: UpdateMilestoneInput): Promise<Milestone> => {
    const response = await api.patch<{ milestone: Milestone }>(
      `/api/milestones/${milestoneId}`,
      data
    );
    return response.milestone;
  },

  deleteMilestone: async (milestoneId: string): Promise<void> => {
    await api.delete(`/api/milestones/${milestoneId}`);
  },

  lockMilestone: async (milestoneId: string, isLocked: boolean): Promise<Milestone> => {
    const response = await api.post<{ milestone: Milestone }>(
      `/api/milestones/${milestoneId}/lock`,
      { isLocked }
    );
    return response.milestone;
  },

  // Change order endpoints
  getChangeOrders: async (projectId: string): Promise<ChangeOrder[]> => {
    const response = await api.get<{ changeOrders: ChangeOrder[] }>(
      `/api/projects/${projectId}/change-orders`
    );
    return response.changeOrders;
  },

  getChangeOrdersByMilestone: async (milestoneId: string): Promise<ChangeOrder[]> => {
    const response = await api.get<{ changeOrders: ChangeOrder[] }>(
      `/api/milestones/${milestoneId}/change-orders`
    );
    return response.changeOrders;
  },

  createChangeOrder: async (
    projectId: string,
    data: CreateChangeOrderInput
  ): Promise<ChangeOrder> => {
    const response = await api.post<{ changeOrder: ChangeOrder }>(
      `/api/projects/${projectId}/change-orders`,
      data
    );
    return response.changeOrder;
  },

  updateChangeOrder: async (
    changeOrderId: string,
    data: UpdateChangeOrderInput
  ): Promise<ChangeOrder> => {
    const response = await api.patch<{ changeOrder: ChangeOrder }>(
      `/api/change-orders/${changeOrderId}`,
      data
    );
    return response.changeOrder;
  },

  deleteChangeOrder: async (changeOrderId: string): Promise<void> => {
    await api.delete(`/api/change-orders/${changeOrderId}`);
  },
};
