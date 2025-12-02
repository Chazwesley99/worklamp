import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/notifications', notificationController.getNotifications.bind(notificationController));
router.get(
  '/notifications/unread-count',
  notificationController.getUnreadCount.bind(notificationController)
);
router.patch(
  '/notifications/:id/read',
  notificationController.markAsRead.bind(notificationController)
);
router.patch(
  '/notifications/read-all',
  notificationController.markAllAsRead.bind(notificationController)
);
router.delete(
  '/notifications/:id',
  notificationController.deleteNotification.bind(notificationController)
);

export default router;
