import { Router } from 'express';
import { featureController } from '../controllers/feature.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes (if project has public feature requests enabled)
router.get('/projects/:projectId/features', featureController.getFeatures.bind(featureController));
router.get('/features/:id', featureController.getFeature.bind(featureController));
router.post('/features/:id/vote', featureController.voteFeature.bind(featureController));

// Authenticated routes
router.post(
  '/projects/:projectId/features',
  authenticate,
  featureController.createFeature.bind(featureController)
);

router.patch(
  '/features/:id',
  authenticate,
  featureController.updateFeature.bind(featureController)
);
router.delete(
  '/features/:id',
  authenticate,
  featureController.deleteFeature.bind(featureController)
);
router.post(
  '/features/:id/assign',
  authenticate,
  featureController.assignUsers.bind(featureController)
);

router.post(
  '/features/:id/comments',
  authenticate,
  featureController.addComment.bind(featureController)
);

export default router;
