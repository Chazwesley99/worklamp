import { Request, Response } from 'express';
import { bugService } from '../services/bug.service';
import { createBugSchema, updateBugSchema, assignBugSchema } from '../validators/bug.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ZodError } from 'zod';

export class BugController {
  /**
   * GET /api/projects/:projectId/bugs
   * Get all bugs for a project
   */
  async getBugs(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const authReq = req as AuthenticatedRequest;

      // Check if this is a public access request
      const isPublicAccess = !authReq.user;
      const tenantId = authReq.user?.tenantId || '';

      const bugs = await bugService.getBugsByProject(projectId, tenantId, isPublicAccess);

      res.json({ bugs });
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
            message: 'Public bug tracking is disabled for this project',
          },
        });
      }

      console.error('Error fetching bugs:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch bugs',
        },
      });
    }
  }

  /**
   * GET /api/bugs/:id
   * Get bug by ID
   */
  async getBug(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;

      const isPublicAccess = !authReq.user;
      const tenantId = authReq.user?.tenantId || '';

      const bug = await bugService.getBugById(id, tenantId, isPublicAccess);

      res.json({ bug });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'BUG_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'BUG_NOT_FOUND',
            message: 'Bug not found',
          },
        });
      }

      if (err.message === 'PUBLIC_ACCESS_DISABLED') {
        return res.status(403).json({
          error: {
            code: 'PUBLIC_ACCESS_DISABLED',
            message: 'Public bug tracking is disabled for this project',
          },
        });
      }

      console.error('Error fetching bug:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch bug',
        },
      });
    }
  }

  /**
   * POST /api/projects/:projectId/bugs
   * Create a new bug
   */
  async createBug(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;
      const userId = authReq.user!.userId;

      const validatedData = createBugSchema.parse(req.body);

      // Handle image upload if present
      const file = (req as Express.Request & { file?: Express.Multer.File }).file;
      const imageBuffer = file?.buffer;
      const imageFilename = file?.originalname;

      const bug = await bugService.createBug(
        projectId,
        tenantId,
        userId,
        validatedData,
        imageBuffer,
        imageFilename
      );

      res.status(201).json({ bug });
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

      console.error('Error creating bug:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create bug',
        },
      });
    }
  }

  /**
   * PATCH /api/bugs/:id
   * Update a bug
   */
  async updateBug(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const validatedData = updateBugSchema.parse(req.body);

      const bug = await bugService.updateBug(id, tenantId, validatedData);

      res.json({ bug });
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
      if (err.message === 'BUG_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'BUG_NOT_FOUND',
            message: 'Bug not found',
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

      console.error('Error updating bug:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update bug',
        },
      });
    }
  }

  /**
   * DELETE /api/bugs/:id
   * Delete a bug
   */
  async deleteBug(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      await bugService.deleteBug(id, tenantId);

      res.json({ success: true });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'BUG_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'BUG_NOT_FOUND',
            message: 'Bug not found',
          },
        });
      }

      console.error('Error deleting bug:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete bug',
        },
      });
    }
  }

  /**
   * POST /api/bugs/:id/assign
   * Assign users to a bug
   */
  async assignUsers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const validatedData = assignBugSchema.parse(req.body);

      const bug = await bugService.assignUsersToBug(id, tenantId, validatedData);

      res.json({ bug });
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
      if (err.message === 'BUG_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'BUG_NOT_FOUND',
            message: 'Bug not found',
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

      console.error('Error assigning users to bug:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign users to bug',
        },
      });
    }
  }

  /**
   * POST /api/bugs/:id/vote
   * Vote on a bug (public if enabled)
   */
  async voteBug(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;

      const isPublicAccess = !authReq.user;
      const tenantId = authReq.user?.tenantId || '';
      const userId = authReq.user?.userId || null;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      const bug = await bugService.voteBug(id, tenantId, userId, ipAddress, isPublicAccess);

      res.json({ bug });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'BUG_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'BUG_NOT_FOUND',
            message: 'Bug not found',
          },
        });
      }

      if (err.message === 'PUBLIC_ACCESS_DISABLED') {
        return res.status(403).json({
          error: {
            code: 'PUBLIC_ACCESS_DISABLED',
            message: 'Public bug tracking is disabled for this project',
          },
        });
      }

      if (err.message === 'ALREADY_VOTED') {
        return res.status(400).json({
          error: {
            code: 'ALREADY_VOTED',
            message: 'You have already voted on this bug',
          },
        });
      }

      console.error('Error voting on bug:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to vote on bug',
        },
      });
    }
  }

  /**
   * POST /api/bugs/:id/image
   * Upload image to bug
   */
  async uploadImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const file = (req as Express.Request & { file?: Express.Multer.File }).file;

      if (!file) {
        return res.status(400).json({
          error: {
            code: 'FILE_REQUIRED',
            message: 'Image file is required',
          },
        });
      }

      const bug = await bugService.uploadBugImage(id, tenantId, file.buffer, file.originalname);

      res.json({ bug });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'BUG_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'BUG_NOT_FOUND',
            message: 'Bug not found',
          },
        });
      }

      console.error('Error uploading bug image:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload bug image',
        },
      });
    }
  }

  /**
   * POST /api/bugs/:id/comments
   * Add comment to bug
   */
  async addComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      // Verify bug exists and belongs to tenant
      await bugService.getBugById(id, tenantId);

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
      if (err.message === 'BUG_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'BUG_NOT_FOUND',
            message: 'Bug not found',
          },
        });
      }

      console.error('Error adding comment to bug:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add comment to bug',
        },
      });
    }
  }
}

export const bugController = new BugController();
