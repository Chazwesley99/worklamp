import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as aiController from '../controllers/ai.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// AI assistant routes
router.post('/analyze-bug', aiController.analyzeBug);
router.post('/generate-feature-spec', aiController.generateFeatureSpec);
router.post('/generate-prompt', aiController.generatePrompt);

export default router;
