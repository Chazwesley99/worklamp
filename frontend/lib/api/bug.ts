import { apiClient } from '../api';

export interface Bug {
  id: string;
  projectId: string;
  title: string;
  description: string;
  url?: string | null;
  imageUrl?: string | null;
  priority: number;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  votes: number;
  ownerId?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignments: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string | null;
    };
  }>;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  bugVotes: Array<{
    id: string;
    userId?: string | null;
    createdAt: string;
  }>;
}

export interface CreateBugRequest {
  title: string;
  description: string;
  url?: string | null;
  priority?: number;
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
  ownerId?: string | null;
  assignedUserIds?: string[];
}

export interface UpdateBugRequest {
  title?: string;
  description?: string;
  url?: string | null;
  priority?: number;
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
  ownerId?: string | null;
}

export interface AssignBugRequest {
  userIds: string[];
}

export const bugApi = {
  /**
   * Get all bugs for a project
   */
  async getBugs(projectId: string): Promise<Bug[]> {
    const response = await apiClient.get<{ bugs: Bug[] }>(`/api/projects/${projectId}/bugs`);
    return response.bugs;
  },

  /**
   * Get bug by ID
   */
  async getBug(bugId: string): Promise<Bug> {
    const response = await apiClient.get<{ bug: Bug }>(`/api/bugs/${bugId}`);
    return response.bug;
  },

  /**
   * Create a new bug
   */
  async createBug(projectId: string, data: CreateBugRequest, imageFile?: File): Promise<Bug> {
    // Clean up data - convert empty strings to null
    const cleanData = {
      ...data,
      url: data.url && data.url.trim() !== '' ? data.url : null,
      ownerId: data.ownerId || null,
      assignedUserIds: data.assignedUserIds || [],
      priority: data.priority ?? 0,
      status: data.status || 'open',
    };

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      Object.entries(cleanData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Get access token from localStorage
      const accessToken =
        typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projects/${projectId}/bugs`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create bug');
      }

      const result = await response.json();
      return result.bug;
    } else {
      const response = await apiClient.post<{ bug: Bug }>(
        `/api/projects/${projectId}/bugs`,
        cleanData
      );
      return response.bug;
    }
  },

  /**
   * Update a bug
   */
  async updateBug(bugId: string, data: UpdateBugRequest): Promise<Bug> {
    const response = await apiClient.patch<{ bug: Bug }>(`/api/bugs/${bugId}`, data);
    return response.bug;
  },

  /**
   * Delete a bug
   */
  async deleteBug(bugId: string): Promise<void> {
    await apiClient.delete<{ success: boolean }>(`/api/bugs/${bugId}`);
  },

  /**
   * Assign users to a bug
   */
  async assignUsers(bugId: string, data: AssignBugRequest): Promise<Bug> {
    const response = await apiClient.post<{ bug: Bug }>(`/api/bugs/${bugId}/assign`, data);
    return response.bug;
  },

  /**
   * Vote on a bug
   */
  async voteBug(bugId: string): Promise<Bug> {
    const response = await apiClient.post<{ bug: Bug }>(`/api/bugs/${bugId}/vote`);
    return response.bug;
  },

  /**
   * Upload image to bug
   */
  async uploadImage(bugId: string, imageFile: File): Promise<Bug> {
    const formData = new FormData();
    formData.append('image', imageFile);

    // Get access token from localStorage
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bugs/${bugId}/image`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload image');
    }

    const result = await response.json();
    return result.bug;
  },
};
