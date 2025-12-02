import { Request, Response } from 'express';
import { commentService } from '../services/comment.service';
import { createCommentSchema, updateCommentSchema } from '../validators/comment.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class CommentController {
  /**
   * GET /api/comments?resourceType=task&resourceId=xxx
   * Get comments for a resource
   */
  async getComments(req: Request, res: Response) {
    try {
      const { resourceType, resourceId } = req.query;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      if (!resourceType || !resourceId) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'resourceType and resourceId are required',
          },
        });
      }

      const comments = await commentService.getCommentsByResource(
        resourceType as string,
        resourceId as string,
        tenantId
      );

      res.json({ comments });
    } catch (error: any) {
      if (error.message === 'RESOURCE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Resource not found',
          },
        });
      }

      if (error.message === 'INVALID_RESOURCE_TYPE') {
        return res.status(400).json({
          error: {
            code: 'INVALID_RESOURCE_TYPE',
            message: 'Invalid resource type',
          },
        });
      }

      console.error('Error fetching comments:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch comments',
        },
      });
    }
  }

  /**
   * POST /api/comments
   * Create a comment
   */
  async createComment(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const tenantId = authReq.user!.tenantId;

      const validatedData = createCommentSchema.parse(req.body);

      const comment = await commentService.createComment(userId, tenantId, validatedData);

      res.status(201).json({ comment });
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

      if (error.message === 'RESOURCE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Resource not found',
          },
        });
      }

      if (error.message === 'INVALID_RESOURCE_TYPE') {
        return res.status(400).json({
          error: {
            code: 'INVALID_RESOURCE_TYPE',
            message: 'Invalid resource type',
          },
        });
      }

      console.error('Error creating comment:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create comment',
        },
      });
    }
  }

  /**
   * PATCH /api/comments/:id
   * Update a comment
   */
  async updateComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const tenantId = authReq.user!.tenantId;

      const validatedData = updateCommentSchema.parse(req.body);

      const comment = await commentService.updateComment(id, userId, tenantId, validatedData);

      res.json({ comment });
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

      if (error.message === 'COMMENT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'COMMENT_NOT_FOUND',
            message: 'Comment not found',
          },
        });
      }

      if (error.message === 'FORBIDDEN_NOT_COMMENT_OWNER') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_NOT_COMMENT_OWNER',
            message: 'You can only edit your own comments',
          },
        });
      }

      if (error.message === 'RESOURCE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Resource not found',
          },
        });
      }

      console.error('Error updating comment:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update comment',
        },
      });
    }
  }

  /**
   * DELETE /api/comments/:id
   * Delete a comment
   */
  async deleteComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;
      const tenantId = authReq.user!.tenantId;

      await commentService.deleteComment(id, userId, tenantId);

      res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'COMMENT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'COMMENT_NOT_FOUND',
            message: 'Comment not found',
          },
        });
      }

      if (error.message === 'FORBIDDEN_NOT_COMMENT_OWNER') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_NOT_COMMENT_OWNER',
            message: 'You can only delete your own comments',
          },
        });
      }

      if (error.message === 'RESOURCE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Resource not found',
          },
        });
      }

      console.error('Error deleting comment:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete comment',
        },
      });
    }
  }
}

export const commentController = new CommentController();
