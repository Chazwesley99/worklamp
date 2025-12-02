import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateToken, setTenantContext } from '../middleware/auth.middleware';
import { uploadSingle, handleUploadError } from '../middleware/upload.middleware';
import * as userEnvVarController from '../controllers/userenvvar.controller';

const router = Router();

// All user routes require authentication and tenant context
router.use(authenticateToken);
router.use(setTenantContext);

// PATCH /api/users/me/password - Change password (email users only)
// This must come before /me to avoid route matching issues
router.patch('/me/password', userController.changePassword.bind(userController));

// GET /api/users/me - Get current user profile
router.get('/me', userController.getMe.bind(userController));

// PATCH /api/users/me - Update current user profile
router.patch('/me', userController.updateMe.bind(userController));

// POST /api/users/me/avatar - Upload avatar
router.post(
  '/me/avatar',
  uploadSingle('avatar'),
  handleUploadError,
  userController.uploadAvatar.bind(userController)
);

// User environment variables routes
router.get('/me/env-vars', userEnvVarController.getUserEnvVars);
router.post('/me/env-vars', userEnvVarController.createUserEnvVar);
router.patch('/me/env-vars/:id', userEnvVarController.updateUserEnvVar);
router.delete('/me/env-vars/:id', userEnvVarController.deleteUserEnvVar);

export default router;
