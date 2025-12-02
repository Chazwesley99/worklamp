import { Request, Response } from 'express';
import { milestoneService } from '../services/milestone.service';
import {
  createMilestoneSchema,
  updateMilestoneSchema,
  lockMilestoneSchema,
} from '../validators/milestone.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class MilestoneController {
  /**
   * GET /api/projects/:projectId/milestones
   * Get all milestones for a project
   */
  async getMilestones(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const milestones = await milestoneService.getMilestonesByProject(projectId, tenantId);

      res.json({ milestones });
    } catch (error: any) {
      if (error.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      console.error('Error fetching milestones:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch milestones',
        },
      });
    }
  }

  /**
   * POST /api/projects/:projectId/milestones
   * Create a new milestone
   */
  async createMilestone(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const validatedData = createMilestoneSchema.parse(req.body);

      const milestone = await milestoneService.createMilestone(projectId, tenantId, validatedData);

      res.status(201).json({ milestone });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors,
          },
        });
      }

      if (error.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      console.error('Error creating milestone:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create milestone',
        },
      });
    }
  }

  /**
   * PATCH /api/milestones/:id
   * Update a milestone
   */
  async updateMilestone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const validatedData = updateMilestoneSchema.parse(req.body);

      const milestone = await milestoneService.updateMilestone(id, tenantId, validatedData);

      res.json({ milestone });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors,
          },
        });
      }

      if (error.message === 'MILESTONE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'MILESTONE_NOT_FOUND',
            message: 'Milestone not found',
          },
        });
      }

      if (error.message === 'MILESTONE_LOCKED') {
        return res.status(409).json({
          error: {
            code: 'MILESTONE_LOCKED',
            message: 'Cannot modify locked milestone',
          },
        });
      }

      console.error('Error updating milestone:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update milestone',
        },
      });
    }
  }

  /**
   * DELETE /api/milestones/:id
   * Delete a milestone
   */
  async deleteMilestone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      await milestoneService.deleteMilestone(id, tenantId);

      res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'MILESTONE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'MILESTONE_NOT_FOUND',
            message: 'Milestone not found',
          },
        });
      }

      if (error.message === 'MILESTONE_LOCKED') {
        return res.status(409).json({
          error: {
            code: 'MILESTONE_LOCKED',
            message: 'Cannot delete locked milestone',
          },
        });
      }

      console.error('Error deleting milestone:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete milestone',
        },
      });
    }
  }

  /**
   * POST /api/milestones/:id/lock
   * Lock or unlock a milestone (version lock)
   */
  async lockMilestone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const validatedData = lockMilestoneSchema.parse(req.body);

      const milestone = await milestoneService.lockMilestone(id, tenantId, validatedData);

      res.json({ milestone });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors,
          },
        });
      }

      if (error.message === 'MILESTONE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'MILESTONE_NOT_FOUND',
            message: 'Milestone not found',
          },
        });
      }

      console.error('Error locking milestone:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to lock milestone',
        },
      });
    }
  }
}

export const milestoneController = new MilestoneController();
