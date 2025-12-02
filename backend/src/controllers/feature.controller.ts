import { Request, Response } from 'express';
import { featureService } from '../services/feature.service';
import {
  createFeatureSchema,
  updateFeatureSchema,
  assignFeatureSchema,
} from '../validators/feature.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ZodError } from 'zod';

export class FeatureController {
  /**
   * GET /api/projects/:projectId/features
   * Get all feature requests for a project
   */
  async getFeatures(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const authReq = req as AuthenticatedRequest;

      // Check if this is a public access request
      const isPublicAccess = !authReq.user;
      const tenantId = authReq.user?.tenantId || '';

      const features = await featureService.getFeaturesByProject(
        projectId,
        tenantId,
        isPublicAccess
      );

      res.json({ features });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      if (err.message === 'PUBLIC_ACCESS_DISABLED') {
        return res.status(403).json({
          error: {
            code: 'PUBLIC_ACCESS_DISABLED',
            message: 'Public feature requests are disabled for this project',
          },
        });
      }

      console.error('Error fetching features:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch feature requests',
        },
      });
    }
  }

  /**
   * GET /api/features/:id
   * Get feature request by ID
   */
  async getFeature(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;

      const isPublicAccess = !authReq.user;
      const tenantId = authReq.user?.tenantId || '';

      const feature = await featureService.getFeatureById(id, tenantId, isPublicAccess);

      res.json({ feature });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'FEATURE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'FEATURE_NOT_FOUND',
            message: 'Feature request not found',
          },
        });
      }

      if (err.message === 'PUBLIC_ACCESS_DISABLED') {
        return res.status(403).json({
          error: {
            code: 'PUBLIC_ACCESS_DISABLED',
            message: 'Public feature requests are disabled for this project',
          },
        });
      }

      console.error('Error fetching feature:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch feature request',
        },
      });
    }
  }

  /**
   * POST /api/projects/:projectId/features
   * Create a new feature request
   */
  async createFeature(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;
      const userId = authReq.user!.userId;

      // Parse body data
      const bodyData: Record<string, unknown> = { ...req.body };

      // Parse JSON fields if they're strings (from FormData)
      if (typeof bodyData.assignedUserIds === 'string') {
        try {
          bodyData.assignedUserIds = JSON.parse(bodyData.assignedUserIds);
        } catch {
          bodyData.assignedUserIds = [];
        }
      }

      // Convert numeric strings to numbers
      if (typeof bodyData.priority === 'string') {
        bodyData.priority = parseInt(bodyData.priority, 10);
      }

      const validatedData = createFeatureSchema.parse(bodyData);

      const feature = await featureService.createFeature(
        projectId,
        tenantId,
        userId,
        validatedData
      );

      res.status(201).json({ feature });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors,
          },
        });
      }

      const err = error as Error;
      if (err.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      if (
        err.message === 'OWNER_NOT_TENANT_MEMBER' ||
        err.message === 'ASSIGNED_USER_NOT_TENANT_MEMBER'
      ) {
        return res.status(400).json({
          error: {
            code: 'INVALID_USER',
            message: 'One or more users are not members of this tenant',
          },
        });
      }

      console.error('Error creating feature:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create feature request',
        },
      });
    }
  }

  /**
   * PATCH /api/features/:id
   * Update a feature request
   */
  async updateFeature(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const validatedData = updateFeatureSchema.parse(req.body);

      const feature = await featureService.updateFeature(id, tenantId, validatedData);

      res.json({ feature });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors,
          },
        });
      }

      const err = error as Error;
      if (err.message === 'FEATURE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'FEATURE_NOT_FOUND',
            message: 'Feature request not found',
          },
        });
      }

      if (err.message === 'OWNER_NOT_TENANT_MEMBER') {
        return res.status(400).json({
          error: {
            code: 'INVALID_USER',
            message: 'Owner is not a member of this tenant',
          },
        });
      }

      console.error('Error updating feature:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update feature request',
        },
      });
    }
  }

  /**
   * DELETE /api/features/:id
   * Delete a feature request
   */
  async deleteFeature(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      await featureService.deleteFeature(id, tenantId);

      res.json({ success: true });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'FEATURE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'FEATURE_NOT_FOUND',
            message: 'Feature request not found',
          },
        });
      }

      console.error('Error deleting feature:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete feature request',
        },
      });
    }
  }

  /**
   * POST /api/features/:id/assign
   * Assign users to a feature request
   */
  async assignUsers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const validatedData = assignFeatureSchema.parse(req.body);

      const feature = await featureService.assignUsersToFeature(id, tenantId, validatedData);

      res.json({ feature });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors,
          },
        });
      }

      const err = error as Error;
      if (err.message === 'FEATURE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'FEATURE_NOT_FOUND',
            message: 'Feature request not found',
          },
        });
      }

      if (err.message === 'ASSIGNED_USER_NOT_TENANT_MEMBER') {
        return res.status(400).json({
          error: {
            code: 'INVALID_USER',
            message: 'One or more users are not members of this tenant',
          },
        });
      }

      console.error('Error assigning users to feature:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign users to feature request',
        },
      });
    }
  }

  /**
   * POST /api/features/:id/vote
   * Vote on a feature request (public if enabled)
   */
  async voteFeature(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;

      const isPublicAccess = !authReq.user;
      const tenantId = authReq.user?.tenantId || '';
      const userId = authReq.user?.userId || null;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      const feature = await featureService.voteFeature(
        id,
        tenantId,
        userId,
        ipAddress,
        isPublicAccess
      );

      res.json({ feature });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'FEATURE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'FEATURE_NOT_FOUND',
            message: 'Feature request not found',
          },
        });
      }

      if (err.message === 'PUBLIC_ACCESS_DISABLED') {
        return res.status(403).json({
          error: {
            code: 'PUBLIC_ACCESS_DISABLED',
            message: 'Public feature requests are disabled for this project',
          },
        });
      }

      if (err.message === 'ALREADY_VOTED') {
        return res.status(400).json({
          error: {
            code: 'ALREADY_VOTED',
            message: 'You have already voted on this feature request',
          },
        });
      }

      console.error('Error voting on feature:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to vote on feature request',
        },
      });
    }
  }

  /**
   * POST /api/features/:id/comments
   * Add comment to feature request
   */
  async addComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      // Verify feature exists and belongs to tenant
      await featureService.getFeatureById(id, tenantId);

      // Forward to comment controller logic
      // This will be handled by the comment routes
      res.status(501).json({
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Use /api/comments endpoint instead',
        },
      });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'FEATURE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'FEATURE_NOT_FOUND',
            message: 'Feature request not found',
          },
        });
      }

      console.error('Error adding comment to feature:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add comment to feature request',
        },
      });
    }
  }
}

export const featureController = new FeatureController();
