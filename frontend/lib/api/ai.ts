import { apiClient } from '../api';

export interface AIConfig {
  id: string;
  tenantId: string;
  provider: 'openai' | 'google' | 'platform';
  hasApiKey: boolean;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAIConfigRequest {
  provider: 'openai' | 'google' | 'platform';
  apiKey?: string | null;
  isEnabled?: boolean;
}

export interface UpdateAIConfigRequest {
  provider?: 'openai' | 'google' | 'platform';
  apiKey?: string | null;
  isEnabled?: boolean;
}

export interface AnalyzeBugRequest {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
}

export interface AnalyzeBugResponse {
  suggestedFixes: string[];
  aiAgentPrompt: string;
  analysis: string;
}

export interface GenerateFeatureSpecRequest {
  title: string;
  description?: string;
}

export interface GenerateFeatureSpecResponse {
  suggestedTitle: string;
  suggestedDescription: string;
  specification: string;
}

export interface GeneratePromptRequest {
  type: 'bug' | 'feature';
  title: string;
  description: string;
  context?: string;
}

export interface GeneratePromptResponse {
  prompt: string;
}

export interface AnalyzeTaskRequest {
  title: string;
  description: string;
  category?: string;
  priority: number;
  status: string;
}

export interface AnalyzeTaskResponse {
  suggestedApproach: string[];
  aiAgentPrompt: string;
  analysis: string;
}

export const aiApi = {
  /**
   * Get AI configuration for current tenant
   */
  async getConfig(): Promise<AIConfig | null> {
    try {
      const response = await apiClient.get<AIConfig>('/api/ai-config/me');
      return response;
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create AI configuration
   */
  async createConfig(data: CreateAIConfigRequest): Promise<AIConfig> {
    const response = await apiClient.post<AIConfig>('/api/ai-config/me', data);
    return response;
  },

  /**
   * Update AI configuration
   */
  async updateConfig(data: UpdateAIConfigRequest): Promise<AIConfig> {
    const response = await apiClient.patch<AIConfig>('/api/ai-config/me', data);
    return response;
  },

  /**
   * Delete AI configuration
   */
  async deleteConfig(): Promise<void> {
    await apiClient.delete<{ success: boolean }>('/api/ai-config/me');
  },

  /**
   * Analyze a bug using AI
   */
  async analyzeBug(data: AnalyzeBugRequest): Promise<AnalyzeBugResponse> {
    const response = await apiClient.post<AnalyzeBugResponse>('/api/ai/analyze-bug', data);
    return response;
  },

  /**
   * Generate feature specification using AI
   */
  async generateFeatureSpec(
    data: GenerateFeatureSpecRequest
  ): Promise<GenerateFeatureSpecResponse> {
    const response = await apiClient.post<GenerateFeatureSpecResponse>(
      '/api/ai/generate-feature-spec',
      data
    );
    return response;
  },

  /**
   * Generate AI agent prompt
   */
  async generatePrompt(data: GeneratePromptRequest): Promise<GeneratePromptResponse> {
    const response = await apiClient.post<GeneratePromptResponse>('/api/ai/generate-prompt', data);
    return response;
  },

  /**
   * Analyze a task using AI
   */
  async analyzeTask(data: AnalyzeTaskRequest): Promise<AnalyzeTaskResponse> {
    const response = await apiClient.post<AnalyzeTaskResponse>('/api/ai/analyze-task', data);
    return response;
  },
};
