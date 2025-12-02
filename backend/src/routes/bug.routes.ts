import { Router } from 'express';
import { bugController } from '../controllers/bug.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadSingle, handleUploadError } from '../middleware/upload.middleware';

const router = Router();

// Public routes (if project has public bug tracking enabled)
router.get('/projects/:projectId/bugs', bugController.getBugs.bind(bugController));
router.get('/bugs/:id', bugController.getBug.bind(bugController));
router.post('/bugs/:id/vote', bugController.voteBug.bind(bugController));

// Authenticated routes
router.post(
  '/projects/:projectId/bugs',
  authenticate,
  uploadSingle('image'),
  handleUploadError,
  bugController.createBug.bind(bugController)
);

router.patch('/bugs/:id', authenticate, bugController.updateBug.bind(bugController));
router.delete('/bugs/:id', authenticate, bugController.deleteBug.bind(bugController));
router.post('/bugs/:id/assign', authenticate, bugController.assignUsers.bind(bugController));

router.post(
  '/bugs/:id/image',
  authenticate,
  uploadSingle('image'),
  handleUploadError,
  bugController.uploadImage.bind(bugController)
);

router.post('/bugs/:id/comments', authenticate, bugController.addComment.bind(bugController));

export default router;
