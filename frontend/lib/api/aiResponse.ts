import { apiClient } from '../api';

export interface AIResponse {
  id: string;
  resourceType: 'task' | 'bug' | 'feature';
  resourceId: string;
  responseData: any;
  createdAt: string;
}

export interface SaveAIResponseRequest {
  resourceType: 'task' | 'bug' | 'feature';
  resourceId: string;
  responseData: any;
}

export const aiResponseApi = {
  /**
   * Save an AI response
   */
  async saveResponse(data: SaveAIResponseRequest): Promise<AIResponse> {
    const response = await apiClient.post<AIResponse>('/api/ai-responses', data);
    return response;
  },

  /**
   * Get AI responses for a resource
   */
  async getResponses(resourceType: string, resourceId: string): Promise<AIResponse[]> {
    const response = await apiClient.get<AIResponse[]>(
      `/api/ai-responses/${resourceType}/${resourceId}`
    );
    return response;
  },

  /**
   * Delete an AI response
   */
  async deleteResponse(id: string): Promise<void> {
    await apiClient.delete<{ success: boolean }>(`/api/ai-responses/${id}`);
  },
};
