import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
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

export interface AnalyzeTaskInput {
  title: string;
  description: string;
  category?: string;
  priority: number;
  status: string;
}

export interface AnalyzeTaskResult {
  suggestedApproach: string[];
  aiAgentPrompt: string;
  analysis: string;
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
        result = await this.callOpenAI<AnalyzeBugResult>(tenantId, prompt);
      } else if (provider === 'google') {
        result = await this.callGoogleAI<AnalyzeBugResult>(tenantId, prompt);
      } else {
        throw new Error('UNSUPPORTED_AI_PROVIDER');
      }

      return result;
    } catch (error: unknown) {
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
        result = await this.callOpenAI<GenerateFeatureSpecResult>(tenantId, prompt);
      } else if (provider === 'google') {
        result = await this.callGoogleAI<GenerateFeatureSpecResult>(tenantId, prompt);
      } else {
        throw new Error('UNSUPPORTED_AI_PROVIDER');
      }

      return result;
    } catch (error: unknown) {
      console.error('AI feature spec generation error:', error);
      throw error;
    }
  }

  /**
   * Analyze a task and provide suggested approach and AI agent prompt
   */
  async analyzeTask(tenantId: string, input: AnalyzeTaskInput): Promise<AnalyzeTaskResult> {
    try {
      // Get AI configuration
      const config = await aiConfigService.getAIConfig(tenantId);

      if (!config || !config.isEnabled) {
        throw new Error('AI_NOT_CONFIGURED');
      }

      // Determine which provider to use
      const provider = config.provider === 'platform' ? 'openai' : config.provider;

      // Build the prompt
      let prompt = `Analyze the following task and provide:
1. A suggested approach or steps to complete the task (2-5 steps)
2. A detailed AI agent prompt that could be used to implement this task
3. A brief analysis of the task complexity and considerations

Task Title: ${input.title}
Task Description: ${input.description}`;

      if (input.category) {
        prompt += `\nCategory: ${input.category}`;
      }

      prompt += `\nPriority: ${input.priority}
Status: ${input.status}`;

      prompt += `\n\nIMPORTANT: You must respond with ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.

Respond with this exact JSON structure:
{
  "suggestedApproach": ["step1", "step2", "step3"],
  "aiAgentPrompt": "detailed prompt for AI agent",
  "analysis": "brief analysis"
}

Ensure all strings are properly escaped and the JSON is valid.`;

      let result: AnalyzeTaskResult;

      if (provider === 'openai') {
        result = await this.callOpenAI<AnalyzeTaskResult>(tenantId, prompt);
      } else if (provider === 'google') {
        result = await this.callGoogleAI<AnalyzeTaskResult>(tenantId, prompt);
      } else {
        throw new Error('UNSUPPORTED_AI_PROVIDER');
      }

      return result;
    } catch (error: unknown) {
      console.error('AI task analysis error:', error);
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
        result = await this.callOpenAI<GeneratePromptResult>(tenantId, prompt);
      } else if (provider === 'google') {
        result = await this.callGoogleAI<GeneratePromptResult>(tenantId, prompt);
      } else {
        throw new Error('UNSUPPORTED_AI_PROVIDER');
      }

      return result;
    } catch (error: unknown) {
      console.error('AI prompt generation error:', error);
      throw error;
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI<T>(tenantId: string, prompt: string): Promise<T> {
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

      return JSON.parse(content) as T;
    } catch (error: unknown) {
      console.error('OpenAI API error:', error);
      const err = error as Error;
      if (
        err.message === 'AI_NOT_CONFIGURED' ||
        err.message === 'PLATFORM_API_KEY_NOT_CONFIGURED'
      ) {
        throw error;
      }
      throw new Error('OPENAI_API_ERROR');
    }
  }

  /**
   * Validate that the response matches expected structure
   */
  private validateResponse<T>(data: unknown, expectedKeys: string[]): T {
    if (!data || typeof data !== 'object') {
      throw new Error('INVALID_AI_RESPONSE_FORMAT');
    }

    const dataObj = data as Record<string, unknown>;
    const missingKeys = expectedKeys.filter((key) => !(key in dataObj));

    if (missingKeys.length > 0) {
      console.error('Missing expected keys:', missingKeys);
      console.error('Received data:', data);
      throw new Error('INVALID_AI_RESPONSE_FORMAT');
    }

    return data as T;
  }

  /**
   * Call Google AI API
   */
  private async callGoogleAI<T>(tenantId: string, prompt: string): Promise<T> {
    try {
      const apiKey = await aiConfigService.getAPIKey(tenantId, 'google');

      const ai = new GoogleGenAI({ apiKey });

      console.log('Calling Google AI with model: gemini-2.5-flash');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      console.log('Google AI response received');
      console.log('Response type:', typeof response);

      // Try different ways to get the text
      let text: string | undefined;

      // Try accessing as property/getter first
      try {
        text = response.text;
      } catch (e) {
        console.log('Could not access response.text, trying candidates structure');
      }

      // Fallback to candidates structure
      if (!text && response.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = response.candidates[0].content.parts[0].text;
      }

      if (!text) {
        console.error('No text in response');
        throw new Error('NO_RESPONSE_FROM_AI');
      }

      console.log('Response text length:', text.length);

      // Try to extract JSON from the response
      // Google AI might wrap JSON in markdown code blocks
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      // Try to parse JSON with better error handling
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error. Attempting to extract JSON object...');

        // Try to find and extract just the JSON object
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[0]);
          } catch (secondError) {
            console.error('Second parse attempt failed');
            console.error('Raw text preview:', text.substring(0, 500));
            throw new Error('INVALID_AI_RESPONSE_FORMAT');
          }
        } else {
          console.error('Could not find JSON object in response');
          console.error('Raw text preview:', text.substring(0, 500));
          throw new Error('INVALID_AI_RESPONSE_FORMAT');
        }
      }

      // Validate the structure based on expected type
      // This is a basic validation - you might want to make this more sophisticated
      if (!parsedData || typeof parsedData !== 'object') {
        console.error('Parsed data is not an object:', parsedData);
        throw new Error('INVALID_AI_RESPONSE_FORMAT');
      }

      return parsedData as T;
    } catch (error: unknown) {
      console.error('Google AI API error:', error);
      const err = error as Error & { status?: number; statusText?: string };

      if (
        err.message === 'AI_NOT_CONFIGURED' ||
        err.message === 'PLATFORM_API_KEY_NOT_CONFIGURED' ||
        err.message === 'INVALID_AI_RESPONSE_FORMAT' ||
        err.message === 'NO_RESPONSE_FROM_AI'
      ) {
        throw error;
      }
      throw new Error('GOOGLE_AI_API_ERROR');
    }
  }
}

export const aiService = new AIService();
