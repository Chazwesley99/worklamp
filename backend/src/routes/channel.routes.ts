import { Router } from 'express';
import { channelController } from '../controllers/channel.controller';
import { authenticate, setTenantContext } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/subscription.middleware';

const router = Router();

// All channel routes require authentication and tenant context
router.use(authenticate);
router.use(setTenantContext);

// Get all channels for a project
router.get('/projects/:projectId/channels', channelController.getChannels.bind(channelController));

// Create new channel (developer+ can create channels)
router.post(
  '/projects/:projectId/channels',
  requireRole('owner', 'admin', 'developer'),
  channelController.createChannel.bind(channelController)
);

// Get channel by ID
router.get('/channels/:id', channelController.getChannel.bind(channelController));

// Update channel (creator or admin/owner only)
router.patch('/channels/:id', channelController.updateChannel.bind(channelController));

// Update channel permissions (creator or admin/owner only)
router.patch(
  '/channels/:id/permissions',
  channelController.updateChannelPermissions.bind(channelController)
);

// Delete channel (creator or admin/owner only)
router.delete('/channels/:id', channelController.deleteChannel.bind(channelController));

// Get messages for a channel
router.get('/channels/:id/messages', channelController.getMessages.bind(channelController));

// Create message in a channel
router.post('/channels/:id/messages', channelController.createMessage.bind(channelController));

export default router;
