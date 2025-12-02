import { Request, Response } from 'express';
import { aiConfigService } from '../services/aiconfig.service';
import { createAIConfigSchema, updateAIConfigSchema } from '../validators/aiconfig.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * Get AI configuration for current tenant
 */
export const getAIConfig = async (req: Request, res: Response) => {
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

    const config = await aiConfigService.getAIConfig(tenantId);

    if (!config) {
      return res.status(404).json({
        error: {
          code: 'AI_CONFIG_NOT_FOUND',
          message: 'AI configuration not found',
        },
      });
    }

    // Don't send the actual API key to the client, just indicate if it exists
    res.json({
      id: config.id,
      tenantId: config.tenantId,
      provider: config.provider,
      hasApiKey: !!config.apiKey,
      isEnabled: config.isEnabled,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    });
  } catch (error: any) {
    console.error('Get AI config error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get AI configuration',
      },
    });
  }
};

/**
 * Create AI configuration
 */
export const createAIConfig = async (req: Request, res: Response) => {
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

    // Validate input
    const validationResult = createAIConfigSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid input',
          details: validationResult.error.errors,
        },
      });
    }

    const config = await aiConfigService.createAIConfig(tenantId, validationResult.data);

    // Don't send the actual API key to the client
    res.status(201).json({
      id: config.id,
      tenantId: config.tenantId,
      provider: config.provider,
      hasApiKey: !!config.apiKey,
      isEnabled: config.isEnabled,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    });
  } catch (error: any) {
    console.error('Create AI config error:', error);

    if (error.message === 'TENANT_NOT_FOUND') {
      return res.status(404).json({
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant not found',
        },
      });
    }

    if (error.message === 'AI_CONFIG_ALREADY_EXISTS') {
      return res.status(409).json({
        error: {
          code: 'AI_CONFIG_ALREADY_EXISTS',
          message: 'AI configuration already exists for this tenant',
        },
      });
    }

    if (error.message === 'API_KEY_REQUIRED_FOR_NON_PLATFORM_PROVIDER') {
      return res.status(400).json({
        error: {
          code: 'API_KEY_REQUIRED',
          message: 'API key is required when not using platform provider',
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create AI configuration',
      },
    });
  }
};

/**
 * Update AI configuration
 */
export const updateAIConfig = async (req: Request, res: Response) => {
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

    // Validate input
    const validationResult = updateAIConfigSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid input',
          details: validationResult.error.errors,
        },
      });
    }

    const config = await aiConfigService.updateAIConfig(tenantId, validationResult.data);

    // Don't send the actual API key to the client
    res.json({
      id: config.id,
      tenantId: config.tenantId,
      provider: config.provider,
      hasApiKey: !!config.apiKey,
      isEnabled: config.isEnabled,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    });
  } catch (error: any) {
    console.error('Update AI config error:', error);

    if (error.message === 'AI_CONFIG_NOT_FOUND') {
      return res.status(404).json({
        error: {
          code: 'AI_CONFIG_NOT_FOUND',
          message: 'AI configuration not found',
        },
      });
    }

    if (error.message === 'API_KEY_REQUIRED_FOR_NON_PLATFORM_PROVIDER') {
      return res.status(400).json({
        error: {
          code: 'API_KEY_REQUIRED',
          message: 'API key is required when not using platform provider',
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update AI configuration',
      },
    });
  }
};

/**
 * Delete AI configuration
 */
export const deleteAIConfig = async (req: Request, res: Response) => {
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

    await aiConfigService.deleteAIConfig(tenantId);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete AI config error:', error);

    if (error.message === 'AI_CONFIG_NOT_FOUND') {
      return res.status(404).json({
        error: {
          code: 'AI_CONFIG_NOT_FOUND',
          message: 'AI configuration not found',
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete AI configuration',
      },
    });
  }
};
