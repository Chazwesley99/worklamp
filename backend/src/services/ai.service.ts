import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiConfigService } from './aiconfig.service';

export interface AnalyzeBugInput {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
}

export interface AnalyzeBugResult {
  suggestedFixes: string[];
  aiAgentPrompt: string;
  analysis: string;
}

export interface GenerateFeatureSpecInput {
  title: string;
  description?: string;
}

export interface GenerateFeatureSpecResult {
  suggestedTitle: string;
  suggestedDescription: string;
  specification: string;
}

export interface GeneratePromptInput {
  type: 'bug' | 'feature';
  title: string;
  description: string;
  context?: string;
}

export interface GeneratePromptResult {
  prompt: string;
}

export class AIService {
  /**
   * Analyze a bug and provide suggested fixes and AI agent prompt
   */
  async analyzeBug(tenantId: string, input: AnalyzeBugInput): Promise<AnalyzeBugResult> {
    try {
      // Get AI configuration
      const config = await aiConfigService.getAIConfig(tenantId);

      if (!config || !config.isEnabled) {
        throw new Error('AI_NOT_CONFIGURED');
      }

      // Determine which provider to use
      const provider = config.provider === 'platform' ? 'openai' : config.provider;

      // Build the prompt
      let prompt = `Analyze the following bug report and provide:
1. A list of potential fixes or solutions
2. A detailed AI agent prompt that could be used to fix this bug
3. A brief analysis of the issue

Bug Title: ${input.title}
Bug Description: ${input.description}`;

      if (input.url) {
        prompt += `\nURL where bug occurs: ${input.url}`;
      }

      if (input.imageUrl) {
        prompt += `\nScreenshot available at: ${input.imageUrl}`;
      }

      prompt += `\n\nPlease format your response as JSON with the following structure:
{
  "suggestedFixes": ["fix1", "fix2", ...],
  "aiAgentPrompt": "detailed prompt for AI agent",
  "analysis": "brief analysis of the issue"
}`;

      let result: AnalyzeBugResult;

      if (provider === 'openai') {
        result = await this.callOpenAI(tenantId, prompt);
      } else if (provider === 'google') {
        result = await this.callGoogleAI(tenantId, prompt);
      } else {
        throw new Error('UNSUPPORTED_AI_PROVIDER');
      }

      return result;
    } catch (error: any) {
      console.error('AI bug analysis error:', error);
      throw error;
    }
  }

  /**
   * Generate feature specification from basic input
   */
  async generateFeatureSpec(
    tenantId: string,
    input: GenerateFeatureSpecInput
  ): Promise<GenerateFeatureSpecResult> {
    try {
      // Get AI configuration
      const config = await aiConfigService.getAIConfig(tenantId);

      if (!config || !config.isEnabled) {
        throw new Error('AI_NOT_CONFIGURED');
      }

      // Determine which provider to use
      const provider = config.provider === 'platform' ? 'openai' : config.provider;

      // Build the prompt
      let prompt = `Generate a detailed feature specification for the following feature request:

Feature Title: ${input.title}`;

      if (input.description) {
        prompt += `\nInitial Description: ${input.description}`;
      }

      prompt += `\n\nPlease provide:
1. A refined, clear title for the feature
2. A comprehensive description of what the feature should do
3. A detailed specification including user stories, acceptance criteria, and technical considerations

Format your response as JSON with the following structure:
{
  "suggestedTitle": "refined title",
  "suggestedDescription": "comprehensive description",
  "specification": "detailed specification with user stories and acceptance criteria"
}`;

      let result: GenerateFeatureSpecResult;

      if (provider === 'openai') {
        result = await this.callOpenAI(tenantId, prompt);
      } else if (provider === 'google') {
        result = await this.callGoogleAI(tenantId, prompt);
      } else {
        throw new Error('UNSUPPORTED_AI_PROVIDER');
      }

      return result;
    } catch (error: any) {
      console.error('AI feature spec generation error:', error);
      throw error;
    }
  }

  /**
   * Generate an AI agent prompt for a bug or feature
   */
  async generatePrompt(
    tenantId: string,
    input: GeneratePromptInput
  ): Promise<GeneratePromptResult> {
    try {
      // Get AI configuration
      const config = await aiConfigService.getAIConfig(tenantId);

      if (!config || !config.isEnabled) {
        throw new Error('AI_NOT_CONFIGURED');
      }

      // Determine which provider to use
      const provider = config.provider === 'platform' ? 'openai' : config.provider;

      // Build the prompt
      let prompt = `Generate a detailed prompt for an AI coding agent to ${
        input.type === 'bug' ? 'fix this bug' : 'implement this feature'
      }:

Title: ${input.title}
Description: ${input.description}`;

      if (input.context) {
        prompt += `\nAdditional Context: ${input.context}`;
      }

      prompt += `\n\nCreate a comprehensive prompt that an AI coding agent can use to ${
        input.type === 'bug' ? 'diagnose and fix the issue' : 'implement the feature'
      }. The prompt should be clear, detailed, and actionable.

Format your response as JSON with the following structure:
{
  "prompt": "the generated AI agent prompt"
}`;

      let result: GeneratePromptResult;

      if (provider === 'openai') {
        result = await this.callOpenAI(tenantId, prompt);
      } else if (provider === 'google') {
        result = await this.callGoogleAI(tenantId, prompt);
      } else {
        throw new Error('UNSUPPORTED_AI_PROVIDER');
      }

      return result;
    } catch (error: any) {
      console.error('AI prompt generation error:', error);
      throw error;
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(tenantId: string, prompt: string): Promise<any> {
    try {
      const apiKey = await aiConfigService.getAPIKey(tenantId, 'openai');

      const openai = new OpenAI({
        apiKey,
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful AI assistant that analyzes bugs and generates feature specifications. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error('NO_RESPONSE_FROM_AI');
      }

      return JSON.parse(content);
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      if (
        error.message === 'AI_NOT_CONFIGURED' ||
        error.message === 'PLATFORM_API_KEY_NOT_CONFIGURED'
      ) {
        throw error;
      }
      throw new Error('OPENAI_API_ERROR');
    }
  }

  /**
   * Call Google AI API
   */
  private async callGoogleAI(tenantId: string, prompt: string): Promise<any> {
    try {
      const apiKey = await aiConfigService.getAPIKey(tenantId, 'google');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('NO_RESPONSE_FROM_AI');
      }

      // Try to extract JSON from the response
      // Google AI might wrap JSON in markdown code blocks
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      return JSON.parse(jsonText);
    } catch (error: any) {
      console.error('Google AI API error:', error);
      if (
        error.message === 'AI_NOT_CONFIGURED' ||
        error.message === 'PLATFORM_API_KEY_NOT_CONFIGURED'
      ) {
        throw error;
      }
      throw new Error('GOOGLE_AI_API_ERROR');
    }
  }
}

export const aiService = new AIService();
