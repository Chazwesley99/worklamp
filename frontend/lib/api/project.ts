import { apiClient } from '../api';

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: 'active' | 'completed' | 'archived';
  publicBugTracking: boolean;
  publicFeatureRequests: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  publicBugTracking?: boolean;
  publicFeatureRequests?: boolean;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string | null;
  status?: 'active' | 'completed' | 'archived';
  publicBugTracking?: boolean;
  publicFeatureRequests?: boolean;
}

export const projectApi = {
  /**
   * Get all projects for current tenant
   */
  async getProjects(): Promise<{ projects: Project[] }> {
    return apiClient.get<{ projects: Project[] }>('/api/projects');
  },

  /**
   * Get project by ID
   */
  async getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(`/api/projects/${id}`);
  },

  /**
   * Create new project
   */
  async createProject(data: CreateProjectRequest): Promise<Project> {
    return apiClient.post<Project>('/api/projects', data);
  },

  /**
   * Update project
   */
  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    return apiClient.patch<Project>(`/api/projects/${id}`, data);
  },

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/projects/${id}`);
  },
};
