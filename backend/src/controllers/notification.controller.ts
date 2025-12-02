import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class NotificationController {
  /**
   * GET /api/notifications
   * Get notifications for the authenticated user
   */
  async getNotifications(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;

      const { limit, unreadOnly } = req.query;
      const limitNum = limit ? parseInt(limit as string, 10) : 50;
      const unreadOnlyBool = unreadOnly === 'true';

      const notifications = await notificationService.getNotificationsByUser(
        userId,
        limitNum,
        unreadOnlyBool
      );

      // Also get unread count
      const unreadCount = await notificationService.getUnreadCount(userId);

      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications',
        },
      });
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;

      const unreadCount = await notificationService.getUnreadCount(userId);

      res.json({ unreadCount });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch unread count',
        },
      });
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a notification as read
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;

      const notification = await notificationService.markAsRead(id, userId);

      res.json({ notification });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'NOTIFICATION_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOTIFICATION_NOT_FOUND',
            message: 'Notification not found',
          },
        });
      }

      console.error('Error marking notification as read:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark notification as read',
        },
      });
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;

      await notificationService.markAllAsRead(userId);

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark all notifications as read',
        },
      });
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;

      await notificationService.deleteNotification(id, userId);

      res.json({ success: true });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'NOTIFICATION_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOTIFICATION_NOT_FOUND',
            message: 'Notification not found',
          },
        });
      }

      console.error('Error deleting notification:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete notification',
        },
      });
    }
  }
}

export const notificationController = new NotificationController();
