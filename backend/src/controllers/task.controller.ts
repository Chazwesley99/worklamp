import { Request, Response } from 'express';
import { taskService } from '../services/task.service';
import { createTaskSchema, updateTaskSchema, assignTaskSchema } from '../validators/task.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class TaskController {
  /**
   * GET /api/projects/:projectId/tasks
   * Get all tasks for a project
   */
  async getTasks(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const tasks = await taskService.getTasksByProject(projectId, tenantId);

      res.json({ tasks });
    } catch (error: any) {
      if (error.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      console.error('Error fetching tasks:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tasks',
        },
      });
    }
  }

  /**
   * POST /api/projects/:projectId/tasks
   * Create a new task
   */
  async createTask(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;
      const userId = authReq.user!.userId;

      const validatedData = createTaskSchema.parse(req.body);

      const task = await taskService.createTask(projectId, tenantId, userId, validatedData);

      res.status(201).json({ task });
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

      if (error.message === 'MILESTONE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'MILESTONE_NOT_FOUND',
            message: 'Milestone not found or does not belong to this project',
          },
        });
      }

      if (
        error.message === 'OWNER_NOT_TENANT_MEMBER' ||
        error.message === 'ASSIGNED_USER_NOT_TENANT_MEMBER'
      ) {
        return res.status(400).json({
          error: {
            code: 'INVALID_USER',
            message: 'One or more users are not members of this tenant',
          },
        });
      }

      console.error('Error creating task:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create task',
        },
      });
    }
  }

  /**
   * PATCH /api/tasks/:id
   * Update a task
   */
  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const validatedData = updateTaskSchema.parse(req.body);

      const task = await taskService.updateTask(id, tenantId, validatedData);

      res.json({ task });
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

      if (error.message === 'TASK_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found',
          },
        });
      }

      if (error.message === 'MILESTONE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'MILESTONE_NOT_FOUND',
            message: 'Milestone not found or does not belong to this project',
          },
        });
      }

      if (error.message === 'OWNER_NOT_TENANT_MEMBER') {
        return res.status(400).json({
          error: {
            code: 'INVALID_USER',
            message: 'Owner is not a member of this tenant',
          },
        });
      }

      console.error('Error updating task:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update task',
        },
      });
    }
  }

  /**
   * DELETE /api/tasks/:id
   * Delete a task
   */
  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      await taskService.deleteTask(id, tenantId);

      res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'TASK_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found',
          },
        });
      }

      console.error('Error deleting task:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete task',
        },
      });
    }
  }

  /**
   * POST /api/tasks/:id/assign
   * Assign users to a task
   */
  async assignUsers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const validatedData = assignTaskSchema.parse(req.body);

      const task = await taskService.assignUsersToTask(id, tenantId, validatedData);

      res.json({ task });
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

      if (error.message === 'TASK_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found',
          },
        });
      }

      if (error.message === 'ASSIGNED_USER_NOT_TENANT_MEMBER') {
        return res.status(400).json({
          error: {
            code: 'INVALID_USER',
            message: 'One or more users are not members of this tenant',
          },
        });
      }

      console.error('Error assigning users to task:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign users to task',
        },
      });
    }
  }
}

export const taskController = new TaskController();
