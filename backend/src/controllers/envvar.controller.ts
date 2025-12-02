import { Request, Response } from 'express';
import * as envVarService from '../services/envvar.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

interface PrismaError extends Error {
  code?: string;
}

/**
 * GET /api/projects/:projectId/env-vars
 * Get all environment variables for a project
 * Requires admin or owner role
 */
export async function getEnvVars(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const tenantId = authReq.user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Authentication required',
        },
      });
    }

    // Verify project belongs to tenant
    const projectBelongsToTenant = await envVarService.verifyProjectTenant(projectId, tenantId);
    if (!projectBelongsToTenant) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_TENANT_MISMATCH',
          message: 'Project does not belong to your tenant',
        },
      });
    }

    // Check if user has permission to access env vars
    const hasPermission = await envVarService.canAccessEnvVars(userId, projectId);
    if (!hasPermission) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
          message: 'Only admin and owner roles can access environment variables',
        },
      });
    }

    const envVars = await envVarService.getEnvVarsByProject(projectId);
    res.json(envVars);
  } catch (error) {
    console.error('Error fetching environment variables:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch environment variables',
      },
    });
  }
}

/**
 * POST /api/projects/:projectId/env-vars
 * Create a new environment variable
 * Requires admin or owner role
 */
export async function createEnvVar(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const { key, value, environment } = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const tenantId = authReq.user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Authentication required',
        },
      });
    }

    // Validate input
    if (!key || !value || !environment) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Key, value, and environment are required',
        },
      });
    }

    if (!['development', 'production'].includes(environment)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Environment must be either "development" or "production"',
        },
      });
    }

    // Verify project belongs to tenant
    const projectBelongsToTenant = await envVarService.verifyProjectTenant(projectId, tenantId);
    if (!projectBelongsToTenant) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_TENANT_MISMATCH',
          message: 'Project does not belong to your tenant',
        },
      });
    }

    // Check if user has permission to access env vars
    const hasPermission = await envVarService.canAccessEnvVars(userId, projectId);
    if (!hasPermission) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
          message: 'Only admin and owner roles can manage environment variables',
        },
      });
    }

    const envVar = await envVarService.createEnvVar({
      projectId,
      key,
      value,
      environment,
      createdById: userId,
    });

    res.status(201).json(envVar);
  } catch (error) {
    console.error('Error creating environment variable:', error);

    // Handle unique constraint violation
    if ((error as PrismaError).code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_ENV_VAR',
          message: 'An environment variable with this key already exists for this environment',
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create environment variable',
      },
    });
  }
}

/**
 * PATCH /api/env-vars/:id
 * Update an environment variable
 * Requires admin or owner role
 */
export async function updateEnvVar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { key, value, environment } = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const tenantId = authReq.user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Authentication required',
        },
      });
    }

    // Validate environment if provided
    if (environment && !['development', 'production'].includes(environment)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Environment must be either "development" or "production"',
        },
      });
    }

    // Get the env var to check project ownership
    const existingEnvVar = await envVarService.getEnvVarById(id);
    if (!existingEnvVar) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Environment variable not found',
        },
      });
    }

    // Verify project belongs to tenant
    const projectBelongsToTenant = await envVarService.verifyProjectTenant(
      existingEnvVar.projectId,
      tenantId
    );
    if (!projectBelongsToTenant) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_TENANT_MISMATCH',
          message: 'Environment variable does not belong to your tenant',
        },
      });
    }

    // Check if user has permission to access env vars
    const hasPermission = await envVarService.canAccessEnvVars(userId, existingEnvVar.projectId);
    if (!hasPermission) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
          message: 'Only admin and owner roles can manage environment variables',
        },
      });
    }

    const envVar = await envVarService.updateEnvVar(id, { key, value, environment }, userId);
    res.json(envVar);
  } catch (error) {
    console.error('Error updating environment variable:', error);

    // Handle unique constraint violation
    if ((error as PrismaError).code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_ENV_VAR',
          message: 'An environment variable with this key already exists for this environment',
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update environment variable',
      },
    });
  }
}

/**
 * DELETE /api/env-vars/:id
 * Delete an environment variable
 * Requires admin or owner role
 */
export async function deleteEnvVar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    const tenantId = authReq.user?.tenantId;

    if (!userId || !tenantId) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Authentication required',
        },
      });
    }

    // Get the env var to check project ownership
    const existingEnvVar = await envVarService.getEnvVarById(id);
    if (!existingEnvVar) {
      return res.status(404).json({
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Environment variable not found',
        },
      });
    }

    // Verify project belongs to tenant
    const projectBelongsToTenant = await envVarService.verifyProjectTenant(
      existingEnvVar.projectId,
      tenantId
    );
    if (!projectBelongsToTenant) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_TENANT_MISMATCH',
          message: 'Environment variable does not belong to your tenant',
        },
      });
    }

    // Check if user has permission to access env vars
    const hasPermission = await envVarService.canAccessEnvVars(userId, existingEnvVar.projectId);
    if (!hasPermission) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
          message: 'Only admin and owner roles can manage environment variables',
        },
      });
    }

    await envVarService.deleteEnvVar(id, userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting environment variable:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete environment variable',
      },
    });
  }
}
