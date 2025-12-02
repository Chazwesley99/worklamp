import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as aiConfigController from '../controllers/aiconfig.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// AI configuration routes
router.get('/me', aiConfigController.getAIConfig);
router.post('/me', aiConfigController.createAIConfig);
router.patch('/me', aiConfigController.updateAIConfig);
router.delete('/me', aiConfigController.deleteAIConfig);

export default router;
