import { Request, Response } from 'express';
import { projectFileService } from '../services/projectfile.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class ProjectFileController {
  /**
   * Get all files for a project
   * GET /api/projects/:projectId/files
   */
  async getFiles(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as AuthRequest['user'];
      const { projectId } = req.params;

      const files = await projectFileService.getProjectFiles(projectId, tenantId);

      res.json({ files });
    } catch (error: any) {
      console.error('Get files error:', error);

      if (error.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get files',
        },
      });
    }
  }

  /**
   * Upload a file
   * POST /api/projects/:projectId/files
   */
  async uploadFile(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as AuthRequest['user'];
      const { projectId } = req.params;
      const { fileType } = req.body;

      if (!req.file) {
        return res.status(400).json({
          error: {
            code: 'NO_FILE_PROVIDED',
            message: 'No file provided',
          },
        });
      }

      if (!fileType || !['requirements', 'design', 'tasks', 'general'].includes(fileType)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Invalid file type. Must be requirements, design, tasks, or general',
          },
        });
      }

      const file = await projectFileService.uploadFile(
        projectId,
        tenantId,
        userId,
        req.file,
        fileType
      );

      res.status(201).json(file);
    } catch (error: any) {
      console.error('Upload file error:', error);

      if (error.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload file',
        },
      });
    }
  }

  /**
   * Delete a file
   * DELETE /api/files/:id
   */
  async deleteFile(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as AuthRequest['user'];
      const { id } = req.params;

      await projectFileService.deleteFile(id, tenantId);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete file error:', error);

      if (error.message === 'FILE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete file',
        },
      });
    }
  }

  /**
   * Generate milestones and tasks from Tasks.md file
   * POST /api/files/:id/generate-milestones
   */
  async generateMilestones(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as AuthRequest['user'];
      const { id } = req.params;

      const results = await projectFileService.generateMilestonesFromTasksFile(
        id,
        tenantId,
        userId
      );

      res.json(results);
    } catch (error: any) {
      console.error('Generate milestones error:', error);

      if (error.message === 'FILE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'File not found',
          },
        });
      }

      if (error.message === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'File must be a tasks file',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate milestones',
        },
      });
    }
  }
}

export const projectFileController = new ProjectFileController();
