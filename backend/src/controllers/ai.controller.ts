import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import {
  analyzeBugSchema,
  generateFeatureSpecSchema,
  generatePromptSchema,
} from '../validators/ai.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const analyzeBug = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication required',
        },
      });
    }

    const validationResult = analyzeBugSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid input',
          details: validationResult.error.errors,
        },
      });
    }

    const result = await aiService.analyzeBug(tenantId, validationResult.data);
    res.json(result);
  } catch (error: unknown) {
    console.error('Analyze bug error:', error);
    const err = error as Error;

    if (err.message === 'AI_NOT_CONFIGURED') {
      return res.status(400).json({
        error: { code: 'AI_NOT_CONFIGURED', message: 'AI is not configured for this tenant' },
      });
    }

    if (err.message === 'PLATFORM_API_KEY_NOT_CONFIGURED') {
      return res.status(500).json({
        error: {
          code: 'PLATFORM_API_KEY_NOT_CONFIGURED',
          message: 'Platform AI API key is not configured',
        },
      });
    }

    if (err.message === 'AI_PROVIDER_MISMATCH') {
      return res.status(400).json({
        error: {
          code: 'AI_PROVIDER_MISMATCH',
          message: 'Configured AI provider does not match requested provider',
        },
      });
    }

    if (err.message === 'OPENAI_API_ERROR' || err.message === 'GOOGLE_AI_API_ERROR') {
      return res.status(502).json({
        error: { code: 'AI_API_ERROR', message: 'Failed to communicate with AI service' },
      });
    }

    if (err.message === 'NO_RESPONSE_FROM_AI') {
      return res.status(502).json({
        error: { code: 'NO_RESPONSE_FROM_AI', message: 'AI service did not return a response' },
      });
    }

    res.status(500).json({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to analyze bug' },
    });
  }
};

export const generateFeatureSpec = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication required',
        },
      });
    }

    const validationResult = generateFeatureSpecSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid input',
          details: validationResult.error.errors,
        },
      });
    }

    const result = await aiService.generateFeatureSpec(tenantId, validationResult.data);
    res.json(result);
  } catch (error: unknown) {
    console.error('Generate feature spec error:', error);
    const err = error as Error;

    if (err.message === 'AI_NOT_CONFIGURED') {
      return res.status(400).json({
        error: { code: 'AI_NOT_CONFIGURED', message: 'AI is not configured for this tenant' },
      });
    }

    if (err.message === 'PLATFORM_API_KEY_NOT_CONFIGURED') {
      return res.status(500).json({
        error: {
          code: 'PLATFORM_API_KEY_NOT_CONFIGURED',
          message: 'Platform AI API key is not configured',
        },
      });
    }

    if (err.message === 'AI_PROVIDER_MISMATCH') {
      return res.status(400).json({
        error: {
          code: 'AI_PROVIDER_MISMATCH',
          message: 'Configured AI provider does not match requested provider',
        },
      });
    }

    if (err.message === 'OPENAI_API_ERROR' || err.message === 'GOOGLE_AI_API_ERROR') {
      return res.status(502).json({
        error: { code: 'AI_API_ERROR', message: 'Failed to communicate with AI service' },
      });
    }

    if (err.message === 'NO_RESPONSE_FROM_AI') {
      return res.status(502).json({
        error: { code: 'NO_RESPONSE_FROM_AI', message: 'AI service did not return a response' },
      });
    }

    res.status(500).json({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate feature specification' },
    });
  }
};

export const generatePrompt = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication required',
        },
      });
    }

    const validationResult = generatePromptSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid input',
          details: validationResult.error.errors,
        },
      });
    }

    const result = await aiService.generatePrompt(tenantId, validationResult.data);
    res.json(result);
  } catch (error: unknown) {
    console.error('Generate prompt error:', error);
    const err = error as Error;

    if (err.message === 'AI_NOT_CONFIGURED') {
      return res.status(400).json({
        error: { code: 'AI_NOT_CONFIGURED', message: 'AI is not configured for this tenant' },
      });
    }

    if (err.message === 'PLATFORM_API_KEY_NOT_CONFIGURED') {
      return res.status(500).json({
        error: {
          code: 'PLATFORM_API_KEY_NOT_CONFIGURED',
          message: 'Platform AI API key is not configured',
        },
      });
    }

    if (err.message === 'AI_PROVIDER_MISMATCH') {
      return res.status(400).json({
        error: {
          code: 'AI_PROVIDER_MISMATCH',
          message: 'Configured AI provider does not match requested provider',
        },
      });
    }

    if (err.message === 'OPENAI_API_ERROR' || err.message === 'GOOGLE_AI_API_ERROR') {
      return res.status(502).json({
        error: { code: 'AI_API_ERROR', message: 'Failed to communicate with AI service' },
      });
    }

    if (err.message === 'NO_RESPONSE_FROM_AI') {
      return res.status(502).json({
        error: { code: 'NO_RESPONSE_FROM_AI', message: 'AI service did not return a response' },
      });
    }

    res.status(500).json({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate prompt' },
    });
  }
};
