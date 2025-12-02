import { apiClient } from '../api';

export interface FeatureRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  votes: number;
  priority: number;
  status: 'proposed' | 'planned' | 'in-progress' | 'completed' | 'rejected';
  ownerId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignments: {
    id: string;
    userId: string;
    assignedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
    };
  }[];
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  featureVotes: {
    id: string;
    userId?: string;
    createdAt: string;
  }[];
}

export interface CreateFeatureInput {
  title: string;
  description: string;
  priority?: number;
  status?: 'proposed' | 'planned' | 'in-progress' | 'completed' | 'rejected';
  ownerId?: string;
  assignedUserIds?: string[];
}

export interface UpdateFeatureInput {
  title?: string;
  description?: string;
  priority?: number;
  status?: 'proposed' | 'planned' | 'in-progress' | 'completed' | 'rejected';
  ownerId?: string;
}

export const featureApi = {
  /**
   * Get all feature requests for a project
   */
  async getFeatures(projectId: string): Promise<FeatureRequest[]> {
    const response = await apiClient.get<{ features: FeatureRequest[] }>(
      `/api/projects/${projectId}/features`
    );
    return response.features;
  },

  /**
   * Get feature request by ID
   */
  async getFeature(featureId: string): Promise<FeatureRequest> {
    const response = await apiClient.get<{ feature: FeatureRequest }>(`/api/features/${featureId}`);
    return response.feature;
  },

  /**
   * Create a new feature request
   */
  async createFeature(projectId: string, data: CreateFeatureInput): Promise<FeatureRequest> {
    const response = await apiClient.post<{ feature: FeatureRequest }>(
      `/api/projects/${projectId}/features`,
      data
    );
    return response.feature;
  },

  /**
   * Update a feature request
   */
  async updateFeature(featureId: string, data: UpdateFeatureInput): Promise<FeatureRequest> {
    const response = await apiClient.patch<{ feature: FeatureRequest }>(
      `/api/features/${featureId}`,
      data
    );
    return response.feature;
  },

  /**
   * Delete a feature request
   */
  async deleteFeature(featureId: string): Promise<void> {
    await apiClient.delete(`/api/features/${featureId}`);
  },

  /**
   * Assign users to a feature request
   */
  async assignUsers(featureId: string, userIds: string[]): Promise<FeatureRequest> {
    const response = await apiClient.post<{ feature: FeatureRequest }>(
      `/api/features/${featureId}/assign`,
      { userIds }
    );
    return response.feature;
  },

  /**
   * Vote on a feature request
   */
  async voteFeature(featureId: string): Promise<FeatureRequest> {
    const response = await apiClient.post<{ feature: FeatureRequest }>(
      `/api/features/${featureId}/vote`
    );
    return response.feature;
  },
};
