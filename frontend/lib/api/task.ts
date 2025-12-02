import { apiClient } from '../api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface Milestone {
  id: string;
  name: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  assignedAt: string;
  user: User;
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId: string | null;
  title: string;
  description: string | null;
  category: string | null;
  priority: number;
  status: 'todo' | 'in-progress' | 'done';
  ownerId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignments: TaskAssignment[];
  milestone: Milestone | null;
  createdBy: User;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  category?: string;
  priority?: number;
  status?: 'todo' | 'in-progress' | 'done';
  milestoneId?: string | null;
  ownerId?: string | null;
  assignedUserIds?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  category?: string | null;
  priority?: number;
  status?: 'todo' | 'in-progress' | 'done';
  milestoneId?: string | null;
  ownerId?: string | null;
}

export interface AssignTaskRequest {
  userIds: string[];
}

export interface Comment {
  id: string;
  resourceType: 'task' | 'bug' | 'feature' | 'milestone';
  resourceId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface CreateCommentRequest {
  content: string;
  resourceType: 'task' | 'bug' | 'feature' | 'milestone';
  resourceId: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export const taskApi = {
  /**
   * Get all tasks for a project
   */
  async getTasks(projectId: string): Promise<{ tasks: Task[] }> {
    return apiClient.get<{ tasks: Task[] }>(`/api/projects/${projectId}/tasks`);
  },

  /**
   * Create new task
   */
  async createTask(projectId: string, data: CreateTaskRequest): Promise<{ task: Task }> {
    return apiClient.post<{ task: Task }>(`/api/projects/${projectId}/tasks`, data);
  },

  /**
   * Update task
   */
  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<{ task: Task }> {
    return apiClient.patch<{ task: Task }>(`/api/tasks/${taskId}`, data);
  },

  /**
   * Delete task
   */
  async deleteTask(taskId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/api/tasks/${taskId}`);
  },

  /**
   * Assign users to task
   */
  async assignUsers(taskId: string, data: AssignTaskRequest): Promise<{ task: Task }> {
    return apiClient.post<{ task: Task }>(`/api/tasks/${taskId}/assign`, data);
  },

  /**
   * Get comments for a resource
   */
  async getComments(
    resourceType: 'task' | 'bug' | 'feature' | 'milestone',
    resourceId: string
  ): Promise<{ comments: Comment[] }> {
    return apiClient.get<{ comments: Comment[] }>(
      `/api/comments?resourceType=${resourceType}&resourceId=${resourceId}`
    );
  },

  /**
   * Create comment
   */
  async createComment(data: CreateCommentRequest): Promise<{ comment: Comment }> {
    return apiClient.post<{ comment: Comment }>('/api/comments', data);
  },

  /**
   * Update comment
   */
  async updateComment(
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<{ comment: Comment }> {
    return apiClient.patch<{ comment: Comment }>(`/api/comments/${commentId}`, data);
  },

  /**
   * Delete comment
   */
  async deleteComment(commentId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/api/comments/${commentId}`);
  },
};
