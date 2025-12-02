import { Router } from 'express';
import { milestoneController } from '../controllers/milestone.controller';
import { changeOrderController } from '../controllers/changeorder.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All milestone routes require authentication
router.use(authenticate);

// Milestone routes
router.get(
  '/projects/:projectId/milestones',
  milestoneController.getMilestones.bind(milestoneController)
);
router.post(
  '/projects/:projectId/milestones',
  milestoneController.createMilestone.bind(milestoneController)
);
router.patch('/milestones/:id', milestoneController.updateMilestone.bind(milestoneController));
router.delete('/milestones/:id', milestoneController.deleteMilestone.bind(milestoneController));
router.post('/milestones/:id/lock', milestoneController.lockMilestone.bind(milestoneController));

// Change order routes
router.get(
  '/projects/:projectId/change-orders',
  changeOrderController.getChangeOrders.bind(changeOrderController)
);
router.get(
  '/milestones/:milestoneId/change-orders',
  changeOrderController.getChangeOrdersByMilestone.bind(changeOrderController)
);
router.post(
  '/projects/:projectId/change-orders',
  changeOrderController.createChangeOrder.bind(changeOrderController)
);
router.patch(
  '/change-orders/:id',
  changeOrderController.updateChangeOrder.bind(changeOrderController)
);
router.delete(
  '/change-orders/:id',
  changeOrderController.deleteChangeOrder.bind(changeOrderController)
);

export default router;
