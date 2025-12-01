import { Request, Response } from 'express';
import { projectService } from '../services/project.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class ProjectController {
  /**
   * Get all projects for tenant
   * GET /api/projects
   */
  async getProjects(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as AuthRequest['user'];

      const projects = await projectService.getProjectsByTenant(tenantId);

      res.json({ projects });
    } catch (error: any) {
      console.error('Get projects error:', error);

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get projects',
        },
      });
    }
  }

  /**
   * Get project by ID
   * GET /api/projects/:id
   */
  async getProject(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as AuthRequest['user'];
      const { id } = req.params;

      const project = await projectService.getProjectById(id, tenantId);

      res.json(project);
    } catch (error: any) {
      console.error('Get project error:', error);

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
          message: 'Failed to get project',
        },
      });
    }
  }

  /**
   * Create new project
   * POST /api/projects
   */
  async createProject(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as AuthRequest['user'];
      const { name, description, publicBugTracking, publicFeatureRequests } = req.body;

      if (!name) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Project name is required',
          },
        });
      }

      const project = await projectService.createProject(tenantId, {
        name,
        description,
        publicBugTracking,
        publicFeatureRequests,
      });

      res.status(201).json(project);
    } catch (error: any) {
      console.error('Create project error:', error);

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create project',
        },
      });
    }
  }

  /**
   * Update project
   * PATCH /api/projects/:id
   */
  async updateProject(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as AuthRequest['user'];
      const { id } = req.params;
      const { name, description, status, publicBugTracking, publicFeatureRequests } = req.body;

      const project = await projectService.updateProject(id, tenantId, {
        name,
        description,
        status,
        publicBugTracking,
        publicFeatureRequests,
      });

      res.json(project);
    } catch (error: any) {
      console.error('Update project error:', error);

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
          message: 'Failed to update project',
        },
      });
    }
  }

  /**
   * Delete project
   * DELETE /api/projects/:id
   */
  async deleteProject(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as AuthRequest['user'];
      const { id } = req.params;

      await projectService.deleteProject(id, tenantId);

      res.json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete project error:', error);

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
          message: 'Failed to delete project',
        },
      });
    }
  }
}

export const projectController = new ProjectController();
