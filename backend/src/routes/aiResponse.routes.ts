import { Router } from 'express';
import { aiResponseController } from '../controllers/aiResponse.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// AI response routes
router.post('/', aiResponseController.saveResponse);
router.get('/:resourceType/:resourceId', aiResponseController.getResponses);
router.delete('/:id', aiResponseController.deleteResponse);

export default router;
