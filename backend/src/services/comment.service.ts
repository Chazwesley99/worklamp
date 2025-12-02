import { prisma } from '../config/database';
import { CreateCommentInput, UpdateCommentInput } from '../validators/comment.validator';

export class CommentService {
  /**
   * Get comments for a resource
   */
  async getCommentsByResource(resourceType: string, resourceId: string, tenantId: string) {
    // Verify resource belongs to tenant based on type
    await this.verifyResourceAccess(resourceType, resourceId, tenantId);

    const comments = await prisma.comment.findMany({
      where: {
        resourceType,
        resourceId,
      },
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
      orderBy: { createdAt: 'asc' },
    });

    return comments;
  }

  /**
   * Create a comment
   */
  async createComment(userId: string, tenantId: string, data: CreateCommentInput) {
    // Verify resource belongs to tenant
    await this.verifyResourceAccess(data.resourceType, data.resourceId, tenantId);

    const comment = await prisma.comment.create({
      data: {
        userId,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        content: data.content,
      },
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
    });

    return comment;
  }

  /**
   * Update a comment
   */
  async updateComment(
    commentId: string,
    userId: string,
    tenantId: string,
    data: UpdateCommentInput
  ) {
    // Get comment and verify ownership
    const comment = await prisma.comment.findFirst({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('COMMENT_NOT_FOUND');
    }

    // Verify user owns the comment
    if (comment.userId !== userId) {
      throw new Error('FORBIDDEN_NOT_COMMENT_OWNER');
    }

    // Verify resource still belongs to tenant
    await this.verifyResourceAccess(comment.resourceType, comment.resourceId, tenantId);

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: data.content },
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
    });

    return updatedComment;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string, tenantId: string) {
    // Get comment and verify ownership
    const comment = await prisma.comment.findFirst({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('COMMENT_NOT_FOUND');
    }

    // Verify user owns the comment
    if (comment.userId !== userId) {
      throw new Error('FORBIDDEN_NOT_COMMENT_OWNER');
    }

    // Verify resource still belongs to tenant
    await this.verifyResourceAccess(comment.resourceType, comment.resourceId, tenantId);

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return { success: true };
  }

  /**
   * Verify that a resource belongs to the tenant
   */
  private async verifyResourceAccess(resourceType: string, resourceId: string, tenantId: string) {
    let resource;

    switch (resourceType) {
      case 'task':
        resource = await prisma.task.findFirst({
          where: {
            id: resourceId,
            project: { tenantId },
          },
        });
        break;

      case 'bug':
        resource = await prisma.bug.findFirst({
          where: {
            id: resourceId,
            project: { tenantId },
          },
        });
        break;

      case 'feature':
        resource = await prisma.featureRequest.findFirst({
          where: {
            id: resourceId,
            project: { tenantId },
          },
        });
        break;

      case 'milestone':
        resource = await prisma.milestone.findFirst({
          where: {
            id: resourceId,
            project: { tenantId },
          },
        });
        break;

      default:
        throw new Error('INVALID_RESOURCE_TYPE');
    }

    if (!resource) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    return resource;
  }
}

export const commentService = new CommentService();
