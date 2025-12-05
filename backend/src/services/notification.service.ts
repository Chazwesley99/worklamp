import { prisma } from '../config/database';

export type NotificationType =
  | 'bug_created'
  | 'feature_created'
  | 'task_assigned'
  | 'mention'
  | 'system';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
}

export class NotificationService {
  /**
   * Get notifications for a user
   */
  async getNotificationsByUser(userId: string, limit: number = 50, unreadOnly: boolean = false) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return notifications;
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  }

  /**
   * Create a notification
   */
  async createNotification(data: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        isRead: false,
      },
    });

    return notification;
  }

  /**
   * Create notifications for multiple users
   */
  async createNotificationsForUsers(
    userIds: string[],
    data: Omit<CreateNotificationInput, 'userId'>
  ) {
    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        isRead: false,
      })),
    });

    return notifications;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('NOTIFICATION_NOT_FOUND');
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updatedNotification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('NOTIFICATION_NOT_FOUND');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }

  /**
   * Notify admins about new bug
   */
  async notifyAdminsAboutBug(
    tenantId: string,
    bugId: string,
    bugTitle: string,
    projectName: string
  ) {
    // Get all admin and owner users for the tenant
    const adminMembers = await prisma.tenantMember.findMany({
      where: {
        tenantId,
        role: { in: ['owner', 'admin'] },
      },
      select: {
        userId: true,
      },
    });

    const adminUserIds = adminMembers.map((member: any) => member.userId);

    if (adminUserIds.length === 0) {
      return { count: 0 };
    }

    // Create notifications for all admins
    await this.createNotificationsForUsers(adminUserIds, {
      type: 'bug_created',
      title: 'New Bug Reported',
      message: `A new bug "${bugTitle}" was reported in project "${projectName}"`,
      resourceType: 'bug',
      resourceId: bugId,
    });

    return { count: adminUserIds.length };
  }

  /**
   * Notify admins about new feature request
   */
  async notifyAdminsAboutFeature(
    tenantId: string,
    featureId: string,
    featureTitle: string,
    projectName: string
  ) {
    // Get all admin and owner users for the tenant
    const adminMembers = await prisma.tenantMember.findMany({
      where: {
        tenantId,
        role: { in: ['owner', 'admin'] },
      },
      select: {
        userId: true,
      },
    });

    const adminUserIds = adminMembers.map((member: any) => member.userId);

    if (adminUserIds.length === 0) {
      return { count: 0 };
    }

    // Create notifications for all admins
    await this.createNotificationsForUsers(adminUserIds, {
      type: 'feature_created',
      title: 'New Feature Request',
      message: `A new feature request "${featureTitle}" was submitted in project "${projectName}"`,
      resourceType: 'feature',
      resourceId: featureId,
    });

    return { count: adminUserIds.length };
  }

  /**
   * Notify user about task assignment
   */
  async notifyTaskAssignment(
    userId: string,
    taskId: string,
    taskTitle: string,
    assignedBy: string
  ) {
    await this.createNotification({
      userId,
      type: 'task_assigned',
      title: 'Task Assigned',
      message: `You were assigned to task "${taskTitle}" by ${assignedBy}`,
      resourceType: 'task',
      resourceId: taskId,
    });

    return { success: true };
  }

  /**
   * Notify admins about new task
   */
  async notifyAdminsAboutTask(
    tenantId: string,
    taskId: string,
    taskTitle: string,
    projectName: string
  ) {
    // Get all admin and owner users for the tenant
    const adminMembers = await prisma.tenantMember.findMany({
      where: {
        tenantId,
        role: { in: ['owner', 'admin'] },
      },
      select: {
        userId: true,
      },
    });

    const adminUserIds = adminMembers.map((member: any) => member.userId);

    if (adminUserIds.length === 0) {
      return { count: 0 };
    }

    // Create notifications for all admins
    await this.createNotificationsForUsers(adminUserIds, {
      type: 'task_assigned',
      title: 'New Task Created',
      message: `A new task "${taskTitle}" was created in project "${projectName}"`,
      resourceType: 'task',
      resourceId: taskId,
    });

    return { count: adminUserIds.length };
  }
}

export const notificationService = new NotificationService();
