import { Router } from 'express';
import { tenantController } from '../controllers/tenant.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All tenant routes require authentication
router.use(authenticate);

// Get current tenant information
router.get('/me', tenantController.getCurrentTenant.bind(tenantController));

// Update tenant settings (owner only)
router.patch('/me', tenantController.updateTenant.bind(tenantController));

// Get tenant members
router.get('/me/members', tenantController.getTenantMembers.bind(tenantController));

// Invite user to tenant (owner/admin only)
router.post('/me/invite', tenantController.inviteUser.bind(tenantController));

// Remove member from tenant (owner/admin only)
router.delete('/members/:userId', tenantController.removeMember.bind(tenantController));

// Update member role (owner/admin only)
router.patch('/members/:userId/role', tenantController.updateMemberRole.bind(tenantController));

export default router;
