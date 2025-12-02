import { Router } from 'express';
import { newsletterController } from '../controllers/newsletter.controller';

const router = Router();

// Public contact form route
router.post('/', newsletterController.contact.bind(newsletterController));

export default router;
