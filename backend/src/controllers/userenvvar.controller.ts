import { Request, Response } from 'express';
import * as userEnvVarService from '../services/userenvvar.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

interface PrismaError extends Error {
  code?: string;
}

/**
 * GET /api/users/me/env-vars
 * Get all environment variables for the current user
 */
export async function getUserEnvVars(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Authentication required',
        },
      });
    }

    const envVars = await userEnvVarService.getUserEnvVarsByUser(userId);
    res.json(envVars);
  } catch (error) {
    console.error('Error fetching user environment variables:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user environment variables',
      },
    });
  }
}

/**
 * POST /api/users/me/env-vars
 * Create a new user environment variable
 */
export async function createUserEnvVar(req: Request, res: Response) {
  try {
    const { key, value } = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Authentication required',
        },
      });
    }

    // Validate input
    if (!key || !value) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Key and value are required',
        },
      });
    }

    const envVar = await userEnvVarService.createUserEnvVar({
      userId,
      key,
      value,
    });

    res.status(201).json(envVar);
  } catch (error) {
    console.error('Error creating user environment variable:', error);

    // Handle unique constraint violation
    if ((error as PrismaError).code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_ENV_VAR',
          message: 'An environment variable with this key already exists',
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user environment variable',
      },
    });
  }
}

/**
 * PATCH /api/users/me/env-vars/:id
 * Update a user environment variable
 */
export async function updateUserEnvVar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { key, value } = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Authentication required',
        },
      });
    }

    // Get the env var to check ownership
    const existingEnvVar = await userEnvVarService.getUserEnvVarById(id);
    if (!existingEnvVar) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User environment variable not found',
        },
      });
    }

    // Verify ownership
    if (existingEnvVar.userId !== userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only modify your own environment variables',
        },
      });
    }

    const envVar = await userEnvVarService.updateUserEnvVar(id, { key, value }, userId);
    res.json(envVar);
  } catch (error) {
    console.error('Error updating user environment variable:', error);

    // Handle unique constraint violation
    if ((error as PrismaError).code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_ENV_VAR',
          message: 'An environment variable with this key already exists',
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update user environment variable',
      },
    });
  }
}

/**
 * DELETE /api/users/me/env-vars/:id
 * Delete a user environment variable
 */
export async function deleteUserEnvVar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Authentication required',
        },
      });
    }

    // Get the env var to check ownership
    const existingEnvVar = await userEnvVarService.getUserEnvVarById(id);
    if (!existingEnvVar) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User environment variable not found',
        },
      });
    }

    // Verify ownership
    if (existingEnvVar.userId !== userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own environment variables',
        },
      });
    }

    await userEnvVarService.deleteUserEnvVar(id, userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user environment variable:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete user environment variable',
      },
    });
  }
}
