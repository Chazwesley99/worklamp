import { prisma } from '../config/database';
import { CreateTaskInput, UpdateTaskInput, AssignTaskInput } from '../validators/task.validator';
import { notificationService } from './notification.service';

export class TaskService {
  /**
   * Get all tasks for a project
   */
  async getTasksByProject(projectId: string, tenantId: string) {
    // Verify project belongs to tenant
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
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
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return tasks;
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string, tenantId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: { tenantId }, // Ensure tenant isolation
      },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
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

    if (!task) {
      throw new Error('TASK_NOT_FOUND');
    }

    return task;
  }

  /**
   * Create a new task
   */
  async createTask(projectId: string, tenantId: string, userId: string, data: CreateTaskInput) {
    // Verify project belongs to tenant
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // If milestoneId is provided, verify it belongs to the project
    if (data.milestoneId) {
      const milestone = await prisma.milestone.findFirst({
        where: { id: data.milestoneId, projectId },
      });

      if (!milestone) {
        throw new Error('MILESTONE_NOT_FOUND');
      }
    }

    // If ownerId is provided, verify they are a member of the tenant
    if (data.ownerId) {
      const ownerMembership = await prisma.tenantMember.findFirst({
        where: { tenantId, userId: data.ownerId },
      });

      if (!ownerMembership) {
        throw new Error('OWNER_NOT_TENANT_MEMBER');
      }
    }

    // Verify all assigned users are members of the tenant
    if (data.assignedUserIds && data.assignedUserIds.length > 0) {
      const memberCount = await prisma.tenantMember.count({
        where: {
          tenantId,
          userId: { in: data.assignedUserIds },
        },
      });

      if (memberCount !== data.assignedUserIds.length) {
        throw new Error('ASSIGNED_USER_NOT_TENANT_MEMBER');
      }
    }

    // Create task with assignments
    const task = await prisma.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority ?? 0,
        status: data.status ?? 'todo',
        milestoneId: data.milestoneId,
        ownerId: data.ownerId,
        createdById: userId,
        assignments: data.assignedUserIds
          ? {
              create: data.assignedUserIds.map((userId) => ({
                userId,
              })),
            }
          : undefined,
      },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
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

    // Notify admins about new task
    try {
      await notificationService.notifyAdminsAboutTask(tenantId, task.id, task.title, project.name);
    } catch (error) {
      // Log error but don't fail the task creation
      console.error('Failed to send task notifications:', error);
    }

    return task;
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, tenantId: string, data: UpdateTaskInput) {
    // Verify task belongs to tenant
    const existingTask = await this.getTaskById(taskId, tenantId);

    // If milestoneId is being updated, verify it belongs to the same project
    if (data.milestoneId !== undefined && data.milestoneId !== null) {
      const milestone = await prisma.milestone.findFirst({
        where: { id: data.milestoneId, projectId: existingTask.projectId },
      });

      if (!milestone) {
        throw new Error('MILESTONE_NOT_FOUND');
      }
    }

    // If ownerId is being updated, verify they are a member of the tenant
    if (data.ownerId !== undefined && data.ownerId !== null) {
      const ownerMembership = await prisma.tenantMember.findFirst({
        where: {
          tenantId,
          userId: data.ownerId,
        },
      });

      if (!ownerMembership) {
        throw new Error('OWNER_NOT_TENANT_MEMBER');
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: data.status,
        milestoneId: data.milestoneId,
        ownerId: data.ownerId,
      },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        milestone: {
          select: {
            id: true,
            name: true,
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

    return updatedTask;
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string, tenantId: string) {
    // Verify task belongs to tenant
    await this.getTaskById(taskId, tenantId);

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { success: true };
  }

  /**
   * Assign users to task
   */
  async assignUsersToTask(taskId: string, tenantId: string, data: AssignTaskInput) {
    // Verify task belongs to tenant
    await this.getTaskById(taskId, tenantId);

    // Verify all users are members of the tenant
    const memberCount = await prisma.tenantMember.count({
      where: {
        tenantId,
        userId: { in: data.userIds },
      },
    });

    if (memberCount !== data.userIds.length) {
      throw new Error('ASSIGNED_USER_NOT_TENANT_MEMBER');
    }

    // Remove existing assignments
    await prisma.taskAssignment.deleteMany({
      where: { taskId },
    });

    // Create new assignments
    await prisma.taskAssignment.createMany({
      data: data.userIds.map((userId) => ({
        taskId,
        userId,
      })),
      skipDuplicates: true,
    });

    // Return updated task with assignments
    return this.getTaskById(taskId, tenantId);
  }
}

export const taskService = new TaskService();
