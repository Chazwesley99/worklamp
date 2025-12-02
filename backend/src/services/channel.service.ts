import { prisma } from '../config/database';
import {
  CreateChannelInput,
  UpdateChannelInput,
  UpdateChannelPermissionsInput,
  CreateMessageInput,
} from '../validators/channel.validator';

export class ChannelService {
  /**
   * Get all channels for a project that the user has permission to view
   */
  async getChannelsByProject(projectId: string, tenantId: string, userId: string) {
    // First verify the project belongs to the tenant
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId,
      },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // Get all channels for the project where user has view permission
    // or channels that are not private
    const channels = await prisma.channel.findMany({
      where: {
        projectId,
        OR: [
          { isPrivate: false },
          {
            permissions: {
              some: {
                userId,
                canView: true,
              },
            },
          },
        ],
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        permissions: {
          where: { userId },
          select: {
            canView: true,
            canPost: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Transform to include user's permissions at the channel level
    return channels.map((channel) => ({
      ...channel,
      userPermissions: channel.permissions[0] || {
        canView: !channel.isPrivate,
        canPost: !channel.isPrivate,
      },
      permissions: undefined, // Remove the permissions array from response
      messageCount: channel._count.messages,
      _count: undefined,
    }));
  }

  /**
   * Get channel by ID with permission check
   */
  async getChannelById(channelId: string, tenantId: string, userId: string) {
    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        project: {
          tenantId, // Ensure tenant isolation
        },
      },
      include: {
        project: {
          select: {
            id: true,
            tenantId: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        permissions: {
          where: { userId },
          select: {
            canView: true,
            canPost: true,
          },
        },
      },
    });

    if (!channel) {
      throw new Error('CHANNEL_NOT_FOUND');
    }

    // Check if user has view permission
    const userPermission = channel.permissions[0];
    const canView = !channel.isPrivate || (userPermission && userPermission.canView);

    if (!canView) {
      throw new Error('FORBIDDEN_INSUFFICIENT_PERMISSIONS');
    }

    return {
      ...channel,
      userPermissions: userPermission || {
        canView: !channel.isPrivate,
        canPost: !channel.isPrivate,
      },
      permissions: undefined,
    };
  }

  /**
   * Create a new channel
   */
  async createChannel(
    projectId: string,
    tenantId: string,
    userId: string,
    data: CreateChannelInput
  ) {
    // Verify project belongs to tenant
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        tenantId,
      },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    const channel = await prisma.channel.create({
      data: {
        projectId,
        name: data.name,
        description: data.description,
        isPrivate: data.isPrivate ?? false,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // If private, create permission for creator
    if (channel.isPrivate) {
      await prisma.channelPermission.create({
        data: {
          channelId: channel.id,
          userId,
          canView: true,
          canPost: true,
        },
      });
    }

    return channel;
  }

  /**
   * Update channel
   */
  async updateChannel(
    channelId: string,
    tenantId: string,
    userId: string,
    data: UpdateChannelInput
  ) {
    // Verify channel exists and user has permission
    const channel = await this.getChannelById(channelId, tenantId, userId);

    // Only creator or admins can update channel settings
    if (channel.createdById !== userId) {
      // Check if user is admin/owner
      const tenantMember = await prisma.tenantMember.findFirst({
        where: {
          tenantId,
          userId,
          role: {
            in: ['owner', 'admin'],
          },
        },
      });

      if (!tenantMember) {
        throw new Error('FORBIDDEN_INSUFFICIENT_PERMISSIONS');
      }
    }

    const updatedChannel = await prisma.channel.update({
      where: { id: channelId },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updatedChannel;
  }

  /**
   * Update channel permissions
   */
  async updateChannelPermissions(
    channelId: string,
    tenantId: string,
    userId: string,
    data: UpdateChannelPermissionsInput
  ) {
    // Verify channel exists and user has permission
    const channel = await this.getChannelById(channelId, tenantId, userId);

    // Only creator or admins can update permissions
    if (channel.createdById !== userId) {
      const tenantMember = await prisma.tenantMember.findFirst({
        where: {
          tenantId,
          userId,
          role: {
            in: ['owner', 'admin'],
          },
        },
      });

      if (!tenantMember) {
        throw new Error('FORBIDDEN_INSUFFICIENT_PERMISSIONS');
      }
    }

    // Delete existing permissions and create new ones
    await prisma.channelPermission.deleteMany({
      where: { channelId },
    });

    if (data.permissions.length > 0) {
      await prisma.channelPermission.createMany({
        data: data.permissions.map((perm) => ({
          channelId,
          userId: perm.userId,
          canView: perm.canView,
          canPost: perm.canPost,
        })),
      });
    }

    return { success: true };
  }

  /**
   * Delete channel
   */
  async deleteChannel(channelId: string, tenantId: string, userId: string) {
    // Verify channel exists and user has permission
    const channel = await this.getChannelById(channelId, tenantId, userId);

    // Only creator or admins can delete channel
    if (channel.createdById !== userId) {
      const tenantMember = await prisma.tenantMember.findFirst({
        where: {
          tenantId,
          userId,
          role: {
            in: ['owner', 'admin'],
          },
        },
      });

      if (!tenantMember) {
        throw new Error('FORBIDDEN_INSUFFICIENT_PERMISSIONS');
      }
    }

    await prisma.channel.delete({
      where: { id: channelId },
    });

    return { success: true };
  }

  /**
   * Get messages for a channel
   */
  async getMessagesByChannel(
    channelId: string,
    tenantId: string,
    userId: string,
    limit: number = 50,
    before?: string
  ) {
    // Verify user has view permission for channel
    await this.getChannelById(channelId, tenantId, userId);

    const messages = await prisma.message.findMany({
      where: {
        channelId,
        ...(before && {
          createdAt: {
            lt: new Date(before),
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse(); // Return in chronological order
  }

  /**
   * Create a message in a channel
   */
  async createMessage(
    channelId: string,
    tenantId: string,
    userId: string,
    data: CreateMessageInput
  ) {
    // Verify user has post permission for channel
    const channel = await this.getChannelById(channelId, tenantId, userId);

    const userPermission = channel.userPermissions;
    if (!userPermission.canPost) {
      throw new Error('FORBIDDEN_INSUFFICIENT_PERMISSIONS');
    }

    const message = await prisma.message.create({
      data: {
        channelId,
        userId,
        content: data.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return message;
  }
}

export const channelService = new ChannelService();
