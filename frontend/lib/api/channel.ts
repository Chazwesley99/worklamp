import { apiClient } from '../api';

export interface Channel {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  userPermissions: {
    canView: boolean;
    canPost: boolean;
  };
  messageCount: number;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface CreateChannelRequest {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateChannelRequest {
  name?: string;
  description?: string | null;
  isPrivate?: boolean;
}

export interface UpdateChannelPermissionsRequest {
  permissions: Array<{
    userId: string;
    canView: boolean;
    canPost: boolean;
  }>;
}

export interface CreateMessageRequest {
  content: string;
}

export const channelApi = {
  /**
   * Get all channels for a project
   */
  async getChannels(projectId: string): Promise<{ channels: Channel[] }> {
    return apiClient.get<{ channels: Channel[] }>(`/api/projects/${projectId}/channels`);
  },

  /**
   * Get channel by ID
   */
  async getChannel(id: string): Promise<Channel> {
    return apiClient.get<Channel>(`/api/channels/${id}`);
  },

  /**
   * Create new channel
   */
  async createChannel(projectId: string, data: CreateChannelRequest): Promise<Channel> {
    return apiClient.post<Channel>(`/api/projects/${projectId}/channels`, data);
  },

  /**
   * Update channel
   */
  async updateChannel(id: string, data: UpdateChannelRequest): Promise<Channel> {
    return apiClient.patch<Channel>(`/api/channels/${id}`, data);
  },

  /**
   * Update channel permissions
   */
  async updateChannelPermissions(
    id: string,
    data: UpdateChannelPermissionsRequest
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>(
      `/api/channels/${id}/permissions`,
      data
    );
  },

  /**
   * Delete channel
   */
  async deleteChannel(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/channels/${id}`);
  },

  /**
   * Get messages for a channel
   */
  async getMessages(
    channelId: string,
    limit?: number,
    before?: string
  ): Promise<{ messages: Message[] }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (before) params.append('before', before);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<{ messages: Message[] }>(`/api/channels/${channelId}/messages${query}`);
  },

  /**
   * Create message in a channel
   */
  async createMessage(channelId: string, data: CreateMessageRequest): Promise<Message> {
    return apiClient.post<Message>(`/api/channels/${channelId}/messages`, data);
  },
};
