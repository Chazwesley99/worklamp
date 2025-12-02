import { prisma } from '../config/database';
import {
  CreateFeatureInput,
  UpdateFeatureInput,
  AssignFeatureInput,
} from '../validators/feature.validator';
import { notificationService } from './notification.service';

export class FeatureService {
  /**
   * Get all feature requests for a project
   */
  async getFeaturesByProject(projectId: string, tenantId: string, isPublicAccess: boolean = false) {
    // Verify project belongs to tenant (unless public access)
    const project = await prisma.project.findFirst({
      where: { id: projectId, tenantId },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // Check if public access is allowed
    if (isPublicAccess && !project.publicFeatureRequests) {
      throw new Error('PUBLIC_ACCESS_DISABLED');
    }

    const features = await prisma.featureRequest.findMany({
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
        featureVotes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ votes: 'desc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });

    return features;
  }

  /**
   * Get feature request by ID
   */
  async getFeatureById(featureId: string, tenantId: string, isPublicAccess: boolean = false) {
    const feature = await prisma.featureRequest.findFirst({
      where: {
        id: featureId,
        project: { tenantId },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            publicFeatureRequests: true,
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
        featureVotes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!feature) {
      throw new Error('FEATURE_NOT_FOUND');
    }

    // Check if public access is allowed
    if (isPublicAccess && !feature.project.publicFeatureRequests) {
      throw new Error('PUBLIC_ACCESS_DISABLED');
    }

    return feature;
  }

  /**
   * Create a new feature request
   */
  async createFeature(
    projectId: string,
    tenantId: string,
    userId: string,
    data: CreateFeatureInput
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

    // Create feature request with assignments
    const feature = await prisma.featureRequest.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        priority: data.priority ?? 0,
        status: data.status ?? 'proposed',
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
        featureVotes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    // Notify admins about new feature request
    try {
      await notificationService.notifyAdminsAboutFeature(
        tenantId,
        feature.id,
        feature.title,
        project.name
      );
    } catch (error) {
      // Log error but don't fail the feature creation
      console.error('Failed to send feature notifications:', error);
    }

    return feature;
  }

  /**
   * Update feature request
   */
  async updateFeature(featureId: string, tenantId: string, data: UpdateFeatureInput) {
    // Verify feature belongs to tenant
    await this.getFeatureById(featureId, tenantId);

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

    const updatedFeature = await prisma.featureRequest.update({
      where: { id: featureId },
      data: {
        title: data.title,
        description: data.description,
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
        featureVotes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    return updatedFeature;
  }

  /**
   * Delete feature request
   */
  async deleteFeature(featureId: string, tenantId: string) {
    // Verify feature belongs to tenant
    await this.getFeatureById(featureId, tenantId);

    await prisma.featureRequest.delete({
      where: { id: featureId },
    });

    return { success: true };
  }

  /**
   * Assign users to feature request
   */
  async assignUsersToFeature(featureId: string, tenantId: string, data: AssignFeatureInput) {
    // Verify feature belongs to tenant
    await this.getFeatureById(featureId, tenantId);

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
    await prisma.featureAssignment.deleteMany({
      where: { featureRequestId: featureId },
    });

    // Create new assignments
    await prisma.featureAssignment.createMany({
      data: data.userIds.map((userId) => ({
        featureRequestId: featureId,
        userId,
      })),
      skipDuplicates: true,
    });

    // Return updated feature with assignments
    return this.getFeatureById(featureId, tenantId);
  }

  /**
   * Vote on a feature request
   */
  async voteFeature(
    featureId: string,
    tenantId: string,
    userId: string | null,
    ipAddress: string,
    isPublicAccess: boolean = false
  ) {
    // Get feature and verify access
    const feature = await this.getFeatureById(featureId, tenantId, isPublicAccess);

    // Check if public voting is allowed
    if (isPublicAccess && !feature.project.publicFeatureRequests) {
      throw new Error('PUBLIC_ACCESS_DISABLED');
    }

    // Check if user/IP has already voted
    const existingVote = await prisma.featureVote.findFirst({
      where: {
        featureRequestId: featureId,
        OR: [userId ? { userId } : { userId: null }, { ipAddress }],
      },
    });

    if (existingVote) {
      throw new Error('ALREADY_VOTED');
    }

    // Create vote
    await prisma.featureVote.create({
      data: {
        featureRequestId: featureId,
        userId,
        ipAddress,
      },
    });

    // Update vote count
    const updatedFeature = await prisma.featureRequest.update({
      where: { id: featureId },
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
        featureVotes: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    return updatedFeature;
  }
}

export const featureService = new FeatureService();
