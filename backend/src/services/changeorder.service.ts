import { prisma } from '../config/database';
import {
  CreateChangeOrderInput,
  UpdateChangeOrderInput,
} from '../validators/changeorder.validator';

export class ChangeOrderService {
  /**
   * Get all change orders for a project
   */
  async getChangeOrdersByProject(projectId: string, tenantId: string) {
    // Verify project belongs to tenant
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const changeOrders = await prisma.changeOrder.findMany({
      where: { projectId },
      include: {
        milestone: {
          select: {
            id: true,
            name: true,
            isLocked: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return changeOrders;
  }

  /**
   * Get change orders for a specific milestone
   */
  async getChangeOrdersByMilestone(milestoneId: string, tenantId: string) {
    // Verify milestone belongs to tenant
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        project: { tenantId },
      },
    });

    if (!milestone) {
      throw new Error('MILESTONE_NOT_FOUND');
    }

    const changeOrders = await prisma.changeOrder.findMany({
      where: { milestoneId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return changeOrders;
  }

  /**
   * Get change order by ID
   */
  async getChangeOrderById(changeOrderId: string, tenantId: string) {
    const changeOrder = await prisma.changeOrder.findFirst({
      where: {
        id: changeOrderId,
        project: { tenantId }, // Ensure tenant isolation
      },
      include: {
        milestone: {
          select: {
            id: true,
            name: true,
            isLocked: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!changeOrder) {
      throw new Error('CHANGE_ORDER_NOT_FOUND');
    }

    return changeOrder;
  }

  /**
   * Create a new change order
   */
  async createChangeOrder(
    projectId: string,
    tenantId: string,
    userId: string,
    data: CreateChangeOrderInput
  ) {
    // Verify project belongs to tenant
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // Verify milestone exists and belongs to the project
    const milestone = await prisma.milestone.findFirst({
      where: { id: data.milestoneId, projectId },
    });

    if (!milestone) {
      throw new Error('MILESTONE_NOT_FOUND');
    }

    // Verify milestone is locked (change orders are only for locked milestones)
    if (!milestone.isLocked) {
      throw new Error('MILESTONE_NOT_LOCKED');
    }

    const changeOrder = await prisma.changeOrder.create({
      data: {
        projectId,
        milestoneId: data.milestoneId,
        title: data.title,
        description: data.description,
        status: data.status ?? 'pending',
        createdById: userId,
      },
      include: {
        milestone: {
          select: {
            id: true,
            name: true,
            isLocked: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return changeOrder;
  }

  /**
   * Update change order
   */
  async updateChangeOrder(changeOrderId: string, tenantId: string, data: UpdateChangeOrderInput) {
    // Verify change order belongs to tenant
    await this.getChangeOrderById(changeOrderId, tenantId);

    const updatedChangeOrder = await prisma.changeOrder.update({
      where: { id: changeOrderId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
      },
      include: {
        milestone: {
          select: {
            id: true,
            name: true,
            isLocked: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updatedChangeOrder;
  }

  /**
   * Delete change order
   */
  async deleteChangeOrder(changeOrderId: string, tenantId: string) {
    // Verify change order belongs to tenant
    await this.getChangeOrderById(changeOrderId, tenantId);

    await prisma.changeOrder.delete({
      where: { id: changeOrderId },
    });

    return { success: true };
  }
}

export const changeOrderService = new ChangeOrderService();
