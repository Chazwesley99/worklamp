import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { uploadSingle, handleUploadError } from '../middleware/upload.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// GET /api/users/me - Get current user profile
router.get('/me', userController.getMe.bind(userController));

// PATCH /api/users/me - Update current user profile
router.patch('/me', userController.updateMe.bind(userController));

// PATCH /api/users/me/password - Change password (email users only)
router.patch('/me/password', userController.changePassword.bind(userController));

// POST /api/users/me/avatar - Upload avatar
router.post(
  '/me/avatar',
  uploadSingle('avatar'),
  handleUploadError,
  userController.uploadAvatar.bind(userController)
);

export default router;
