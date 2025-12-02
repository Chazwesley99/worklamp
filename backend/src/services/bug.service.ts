import { prisma } from '../config/database';
import { CreateBugInput, UpdateBugInput, AssignBugInput } from '../validators/bug.validator';
import { imageService } from './image.service';
import { notificationService } from './notification.service';

export class BugService {
  /**
   * Get all bugs for a project
   */
  async getBugsByProject(projectId: string, tenantId: string, isPublicAccess: boolean = false) {
    // Verify project belongs to tenant (unless public access)
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // Check if public access is allowed
    if (isPublicAccess && !project.publicBugTracking) {
      throw new Error('PUBLIC_ACCESS_DISABLED');
    }

    const bugs = await prisma.bug.findMany({
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        bugVotes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { votes: 'desc' }, { createdAt: 'desc' }],
    });

    return bugs;
  }

  /**
   * Get bug by ID
   */
  async getBugById(bugId: string, tenantId: string, isPublicAccess: boolean = false) {
    const bug = await prisma.bug.findFirst({
      where: {
        id: bugId,
        project: { tenantId },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            publicBugTracking: true,
          },
        },
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        bugVotes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!bug) {
      throw new Error('BUG_NOT_FOUND');
    }

    // Check if public access is allowed
    if (isPublicAccess && !bug.project.publicBugTracking) {
      throw new Error('PUBLIC_ACCESS_DISABLED');
    }

    return bug;
  }

  /**
   * Create a new bug
   */
  async createBug(
    projectId: string,
    tenantId: string,
    userId: string,
    data: CreateBugInput,
    imageBuffer?: Buffer,
    imageFilename?: string
  ) {
    // Verify project belongs to tenant
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
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

    // Handle image upload if provided
    let imageUrl: string | undefined;
    if (imageBuffer && imageFilename) {
      const uploadResult = await imageService.optimizeAndUpload(
        imageBuffer,
        imageFilename,
        `bugs/${tenantId}`,
        { maxWidth: 1920, maxHeight: 1920, quality: 85, format: 'jpeg' }
      );
      imageUrl = uploadResult.url;
    }

    // Create bug with assignments
    const bug = await prisma.bug.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        url: data.url,
        imageUrl,
        priority: data.priority ?? 0,
        status: data.status ?? 'open',
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        bugVotes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    // Notify admins about new bug
    try {
      await notificationService.notifyAdminsAboutBug(tenantId, bug.id, bug.title, project.name);
    } catch (error) {
      // Log error but don't fail the bug creation
      console.error('Failed to send bug notifications:', error);
    }

    return bug;
  }

  /**
   * Update bug
   */
  async updateBug(bugId: string, tenantId: string, data: UpdateBugInput) {
    // Verify bug belongs to tenant
    await this.getBugById(bugId, tenantId);

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

    const updatedBug = await prisma.bug.update({
      where: { id: bugId },
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        priority: data.priority,
        status: data.status,
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        bugVotes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    return updatedBug;
  }

  /**
   * Delete bug
   */
  async deleteBug(bugId: string, tenantId: string) {
    // Verify bug belongs to tenant
    await this.getBugById(bugId, tenantId);

    await prisma.bug.delete({
      where: { id: bugId },
    });

    return { success: true };
  }

  /**
   * Assign users to bug
   */
  async assignUsersToBug(bugId: string, tenantId: string, data: AssignBugInput) {
    // Verify bug belongs to tenant
    await this.getBugById(bugId, tenantId);

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
    await prisma.bugAssignment.deleteMany({
      where: { bugId },
    });

    // Create new assignments
    await prisma.bugAssignment.createMany({
      data: data.userIds.map((userId) => ({
        bugId,
        userId,
      })),
      skipDuplicates: true,
    });

    // Return updated bug with assignments
    return this.getBugById(bugId, tenantId);
  }

  /**
   * Vote on a bug
   */
  async voteBug(
    bugId: string,
    tenantId: string,
    userId: string | null,
    ipAddress: string,
    isPublicAccess: boolean = false
  ) {
    // Get bug and verify access
    const bug = await this.getBugById(bugId, tenantId, isPublicAccess);

    // Check if public voting is allowed
    if (isPublicAccess && !bug.project.publicBugTracking) {
      throw new Error('PUBLIC_ACCESS_DISABLED');
    }

    // Check if user/IP has already voted
    const existingVote = await prisma.bugVote.findFirst({
      where: {
        bugId,
        OR: [userId ? { userId } : { userId: null }, { ipAddress }],
      },
    });

    if (existingVote) {
      throw new Error('ALREADY_VOTED');
    }

    // Create vote
    await prisma.bugVote.create({
      data: {
        bugId,
        userId,
        ipAddress,
      },
    });

    // Update vote count
    const updatedBug = await prisma.bug.update({
      where: { id: bugId },
      data: {
        votes: {
          increment: 1,
        },
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        bugVotes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    return updatedBug;
  }

  /**
   * Upload image to existing bug
   */
  async uploadBugImage(
    bugId: string,
    tenantId: string,
    imageBuffer: Buffer,
    imageFilename: string
  ) {
    // Verify bug belongs to tenant
    await this.getBugById(bugId, tenantId);

    // Upload and optimize image
    const uploadResult = await imageService.optimizeAndUpload(
      imageBuffer,
      imageFilename,
      `bugs/${tenantId}`,
      { maxWidth: 1920, maxHeight: 1920, quality: 85, format: 'jpeg' }
    );

    // Update bug with image URL
    const updatedBug = await prisma.bug.update({
      where: { id: bugId },
      data: {
        imageUrl: uploadResult.url,
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        bugVotes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    return updatedBug;
  }
}

export const bugService = new BugService();
