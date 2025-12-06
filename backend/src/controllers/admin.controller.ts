import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { updateUserAdminSchema } from '../validators/admin.validator';
import { ZodError } from 'zod';

export class AdminController {
  /**
   * GET /api/admin/users - Get all users (admin only)
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string;

      const result = await adminService.getAllUsers(page, limit, search);

      res.json(result);
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get users',
        },
      });
    }
  }

  /**
   * GET /api/admin/users/:id - Get user by ID (admin only)
   */
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await adminService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get user',
        },
      });
    }
  }

  /**
   * PATCH /api/admin/users/:id - Update user (admin only)
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Validate input
      const validatedData = updateUserAdminSchema.parse(req.body);

      const user = await adminService.updateUser(id, validatedData);

      res.json(user);
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

      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      console.error('Error updating user:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user',
        },
      });
    }
  }

  /**
   * DELETE /api/admin/users/:id - Delete user (admin only)
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await adminService.deleteUser(id);

      res.json({
        message: 'User deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      if (error instanceof Error && error.message === 'Cannot delete your own account') {
        return res.status(400).json({
          error: {
            code: 'CANNOT_DELETE_SELF',
            message: 'Cannot delete your own account',
          },
        });
      }

      console.error('Error deleting user:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete user',
        },
      });
    }
  }

  /**
   * PATCH /api/admin/users/:userId/tenant/:tenantId - Update user's tenant
   */
  async updateUserTenant(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;

      const data = {
        subscriptionTier: req.body.subscriptionTier,
        maxProjects: req.body.maxProjects,
        maxTeamMembers: req.body.maxTeamMembers,
      };

      const tenant = await adminService.updateUserTenant(tenantId, data);

      res.json(tenant);
    } catch (error) {
      if (error instanceof Error && error.message === 'Tenant not found') {
        return res.status(404).json({
          error: {
            code: 'TENANT_NOT_FOUND',
            message: 'Tenant not found',
          },
        });
      }

      console.error('Error updating tenant:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update tenant',
        },
      });
    }
  }

  /**
   * GET /api/admin/stats - Get platform statistics (admin only)
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getStats();

      res.json(stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get statistics',
        },
      });
    }
  }
}

export const adminController = new AdminController();
