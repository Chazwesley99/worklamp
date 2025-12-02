import { prisma } from '../config/database';
import {
  CreateMilestoneInput,
  UpdateMilestoneInput,
  LockMilestoneInput,
} from '../validators/milestone.validator';

export class MilestoneService {
  /**
   * Get all milestones for a project
   */
  async getMilestonesByProject(projectId: string, tenantId: string) {
    // Verify project belongs to tenant
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        changeOrders: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { estimatedCompletionDate: 'asc' }],
    });

    return milestones;
  }

  /**
   * Get milestone by ID
   */
  async getMilestoneById(milestoneId: string, tenantId: string) {
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        project: { tenantId }, // Ensure tenant isolation
      },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
        changeOrders: {
          select: {
            id: true,
            title: true,
            status: true,
            description: true,
            createdAt: true,
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

    if (!milestone) {
      throw new Error('MILESTONE_NOT_FOUND');
    }

    return milestone;
  }

  /**
   * Create a new milestone
   */
  async createMilestone(projectId: string, tenantId: string, data: CreateMilestoneInput) {
    // Verify project belongs to tenant
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const milestone = await prisma.milestone.create({
      data: {
        projectId,
        name: data.name,
        description: data.description,
        estimatedCompletionDate: new Date(data.estimatedCompletionDate),
        status: data.status ?? 'planned',
        order: data.order ?? 0,
      },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        changeOrders: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return milestone;
  }

  /**
   * Update milestone
   */
  async updateMilestone(milestoneId: string, tenantId: string, data: UpdateMilestoneInput) {
    // Verify milestone belongs to tenant
    const existingMilestone = await this.getMilestoneById(milestoneId, tenantId);

    // Check if milestone is locked
    if (existingMilestone.isLocked) {
      throw new Error('MILESTONE_LOCKED');
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        name: data.name,
        description: data.description,
        estimatedCompletionDate: data.estimatedCompletionDate
          ? new Date(data.estimatedCompletionDate)
          : undefined,
        actualCompletionDate: data.actualCompletionDate
          ? new Date(data.actualCompletionDate)
          : data.actualCompletionDate === null
            ? null
            : undefined,
        status: data.status,
        order: data.order,
      },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        changeOrders: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return updatedMilestone;
  }

  /**
   * Delete milestone
   */
  async deleteMilestone(milestoneId: string, tenantId: string) {
    // Verify milestone belongs to tenant
    const existingMilestone = await this.getMilestoneById(milestoneId, tenantId);

    // Check if milestone is locked
    if (existingMilestone.isLocked) {
      throw new Error('MILESTONE_LOCKED');
    }

    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    return { success: true };
  }

  /**
   * Lock/unlock milestone (version lock)
   */
  async lockMilestone(milestoneId: string, tenantId: string, data: LockMilestoneInput) {
    // Verify milestone belongs to tenant
    await this.getMilestoneById(milestoneId, tenantId);

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        isLocked: data.isLocked,
      },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        changeOrders: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return updatedMilestone;
  }
}

export const milestoneService = new MilestoneService();
