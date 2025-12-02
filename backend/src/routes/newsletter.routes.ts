import { Router } from 'express';
import { newsletterController } from '../controllers/newsletter.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/subscribe', newsletterController.subscribe.bind(newsletterController));
router.post('/unsubscribe', newsletterController.unsubscribe.bind(newsletterController));

// Admin-only route
router.post('/send', authenticate, newsletterController.sendNewsletter.bind(newsletterController));

export default router;
