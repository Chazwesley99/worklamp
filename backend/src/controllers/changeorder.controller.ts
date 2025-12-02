import { Request, Response } from 'express';
import { changeOrderService } from '../services/changeorder.service';
import {
  createChangeOrderSchema,
  updateChangeOrderSchema,
} from '../validators/changeorder.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ChangeOrderController {
  /**
   * GET /api/projects/:projectId/change-orders
   * Get all change orders for a project
   */
  async getChangeOrders(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const changeOrders = await changeOrderService.getChangeOrdersByProject(projectId, tenantId);

      res.json({ changeOrders });
    } catch (error: any) {
      if (error.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      console.error('Error fetching change orders:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch change orders',
        },
      });
    }
  }

  /**
   * GET /api/milestones/:milestoneId/change-orders
   * Get all change orders for a milestone
   */
  async getChangeOrdersByMilestone(req: Request, res: Response) {
    try {
      const { milestoneId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const changeOrders = await changeOrderService.getChangeOrdersByMilestone(
        milestoneId,
        tenantId
      );

      res.json({ changeOrders });
    } catch (error: any) {
      if (error.message === 'MILESTONE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'MILESTONE_NOT_FOUND',
            message: 'Milestone not found',
          },
        });
      }

      console.error('Error fetching change orders:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch change orders',
        },
      });
    }
  }

  /**
   * POST /api/projects/:projectId/change-orders
   * Create a new change order
   */
  async createChangeOrder(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;
      const userId = authReq.user!.userId;

      const validatedData = createChangeOrderSchema.parse(req.body);

      const changeOrder = await changeOrderService.createChangeOrder(
        projectId,
        tenantId,
        userId,
        validatedData
      );

      res.status(201).json({ changeOrder });
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

      if (error.message === 'MILESTONE_NOT_LOCKED') {
        return res.status(400).json({
          error: {
            code: 'MILESTONE_NOT_LOCKED',
            message: 'Change orders can only be created for locked milestones',
          },
        });
      }

      console.error('Error creating change order:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create change order',
        },
      });
    }
  }

  /**
   * PATCH /api/change-orders/:id
   * Update a change order
   */
  async updateChangeOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      const validatedData = updateChangeOrderSchema.parse(req.body);

      const changeOrder = await changeOrderService.updateChangeOrder(id, tenantId, validatedData);

      res.json({ changeOrder });
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

      if (error.message === 'CHANGE_ORDER_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'CHANGE_ORDER_NOT_FOUND',
            message: 'Change order not found',
          },
        });
      }

      console.error('Error updating change order:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update change order',
        },
      });
    }
  }

  /**
   * DELETE /api/change-orders/:id
   * Delete a change order
   */
  async deleteChangeOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user!.tenantId;

      await changeOrderService.deleteChangeOrder(id, tenantId);

      res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'CHANGE_ORDER_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'CHANGE_ORDER_NOT_FOUND',
            message: 'Change order not found',
          },
        });
      }

      console.error('Error deleting change order:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete change order',
        },
      });
    }
  }
}

export const changeOrderController = new ChangeOrderController();
