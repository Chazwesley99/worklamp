import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/stats - Get platform statistics
router.get('/stats', adminController.getStats.bind(adminController));

// GET /api/admin/users - Get all users
router.get('/users', adminController.getAllUsers.bind(adminController));

// GET /api/admin/users/:id - Get user by ID
router.get('/users/:id', adminController.getUserById.bind(adminController));

// PATCH /api/admin/users/:id - Update user
router.patch('/users/:id', adminController.updateUser.bind(adminController));

// PATCH /api/admin/users/:userId/tenant/:tenantId - Update user's tenant
router.patch(
  '/users/:userId/tenant/:tenantId',
  adminController.updateUserTenant.bind(adminController)
);

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', adminController.deleteUser.bind(adminController));

export default router;
