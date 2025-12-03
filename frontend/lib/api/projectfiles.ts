import { apiClient } from '../api';

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  originalName: string;
  fileType: 'requirements' | 'design' | 'tasks' | 'general';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedById: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  estimatedCompletionDate: string;
  actualCompletionDate: string | null;
  status: 'planned' | 'in-progress' | 'completed';
  isLocked: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateMilestonesResult {
  milestonesCreated: number;
  tasksCreated: number;
  milestones: Milestone[];
}

export const projectFilesApi = {
  /**
   * Get all files for a project
   */
  async getFiles(projectId: string): Promise<{ files: ProjectFile[] }> {
    return apiClient.get<{ files: ProjectFile[] }>(`/api/projects/${projectId}/files`);
  },

  /**
   * Upload a file
   */
  async uploadFile(
    projectId: string,
    file: File,
    fileType: 'requirements' | 'design' | 'tasks' | 'general'
  ): Promise<ProjectFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/files`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  },

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete<void>(`/api/files/${fileId}`);
  },

  /**
   * Generate milestones and tasks from a tasks file
   */
  async generateMilestones(fileId: string): Promise<GenerateMilestonesResult> {
    return apiClient.post<GenerateMilestonesResult>(`/api/files/${fileId}/generate-milestones`);
  },
};
