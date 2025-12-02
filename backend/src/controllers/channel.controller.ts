import { Request, Response } from 'express';
import { channelService } from '../services/channel.service';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createChannelSchema,
  updateChannelSchema,
  updateChannelPermissionsSchema,
  createMessageSchema,
} from '../validators/channel.validator';
import { emitToChannel } from '../websocket/socket';
import { ZodError } from 'zod';

export class ChannelController {
  /**
   * Get all channels for a project
   * GET /api/projects/:projectId/channels
   */
  async getChannels(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as AuthRequest['user'];
      const { projectId } = req.params;

      const channels = await channelService.getChannelsByProject(projectId, tenantId, userId);

      res.json({ channels });
    } catch (error) {
      console.error('Get channels error:', error);

      const err = error as Error;
      if (err.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get channels',
        },
      });
    }
  }

  /**
   * Get channel by ID
   * GET /api/channels/:id
   */
  async getChannel(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as AuthRequest['user'];
      const { id } = req.params;

      const channel = await channelService.getChannelById(id, tenantId, userId);

      res.json(channel);
    } catch (error) {
      console.error('Get channel error:', error);

      const err = error as Error;
      if (err.message === 'CHANNEL_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'CHANNEL_NOT_FOUND',
            message: 'Channel not found',
          },
        });
      }

      if (err.message === 'FORBIDDEN_INSUFFICIENT_PERMISSIONS') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to view this channel',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get channel',
        },
      });
    }
  }

  /**
   * Create new channel
   * POST /api/projects/:projectId/channels
   */
  async createChannel(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as AuthRequest['user'];
      const { projectId } = req.params;

      // Validate input
      const validatedData = createChannelSchema.parse(req.body);

      const channel = await channelService.createChannel(
        projectId,
        tenantId,
        userId,
        validatedData
      );

      res.status(201).json(channel);
    } catch (error) {
      console.error('Create channel error:', error);

      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid input',
            details: error.errors,
          },
        });
      }

      const err = error as Error;
      if (err.message === 'PROJECT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create channel',
        },
      });
    }
  }

  /**
   * Update channel
   * PATCH /api/channels/:id
   */
  async updateChannel(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as AuthRequest['user'];
      const { id } = req.params;

      // Validate input
      const validatedData = updateChannelSchema.parse(req.body);

      const channel = await channelService.updateChannel(id, tenantId, userId, validatedData);

      res.json(channel);
    } catch (error) {
      console.error('Update channel error:', error);

      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid input',
            details: error.errors,
          },
        });
      }

      const err = error as Error;
      if (err.message === 'CHANNEL_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'CHANNEL_NOT_FOUND',
            message: 'Channel not found',
          },
        });
      }

      if (err.message === 'FORBIDDEN_INSUFFICIENT_PERMISSIONS') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to update this channel',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update channel',
        },
      });
    }
  }

  /**
   * Update channel permissions
   * PATCH /api/channels/:id/permissions
   */
  async updateChannelPermissions(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as AuthRequest['user'];
      const { id } = req.params;

      // Validate input
      const validatedData = updateChannelPermissionsSchema.parse(req.body);

      await channelService.updateChannelPermissions(id, tenantId, userId, validatedData);

      res.json({ success: true, message: 'Permissions updated successfully' });
    } catch (error) {
      console.error('Update channel permissions error:', error);

      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid input',
            details: error.errors,
          },
        });
      }

      const err = error as Error;
      if (err.message === 'CHANNEL_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'CHANNEL_NOT_FOUND',
            message: 'Channel not found',
          },
        });
      }

      if (err.message === 'FORBIDDEN_INSUFFICIENT_PERMISSIONS') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to update channel permissions',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update channel permissions',
        },
      });
    }
  }

  /**
   * Delete channel
   * DELETE /api/channels/:id
   */
  async deleteChannel(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as AuthRequest['user'];
      const { id } = req.params;

      await channelService.deleteChannel(id, tenantId, userId);

      res.json({
        success: true,
        message: 'Channel deleted successfully',
      });
    } catch (error) {
      console.error('Delete channel error:', error);

      const err = error as Error;
      if (err.message === 'CHANNEL_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'CHANNEL_NOT_FOUND',
            message: 'Channel not found',
          },
        });
      }

      if (err.message === 'FORBIDDEN_INSUFFICIENT_PERMISSIONS') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to delete this channel',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete channel',
        },
      });
    }
  }

  /**
   * Get messages for a channel
   * GET /api/channels/:id/messages
   */
  async getMessages(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as AuthRequest['user'];
      const { id } = req.params;
      const { limit, before } = req.query;

      const messages = await channelService.getMessagesByChannel(
        id,
        tenantId,
        userId,
        limit ? parseInt(limit as string) : 50,
        before as string | undefined
      );

      res.json({ messages });
    } catch (error) {
      console.error('Get messages error:', error);

      const err = error as Error;
      if (err.message === 'CHANNEL_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'CHANNEL_NOT_FOUND',
            message: 'Channel not found',
          },
        });
      }

      if (err.message === 'FORBIDDEN_INSUFFICIENT_PERMISSIONS') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to view messages in this channel',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get messages',
        },
      });
    }
  }

  /**
   * Create message in a channel
   * POST /api/channels/:id/messages
   */
  async createMessage(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as AuthRequest['user'];
      const { id } = req.params;

      // Validate input
      const validatedData = createMessageSchema.parse(req.body);

      const message = await channelService.createMessage(id, tenantId, userId, validatedData);

      // Emit real-time event to channel
      emitToChannel(tenantId, id, 'message:new', {
        message,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json(message);
    } catch (error) {
      console.error('Create message error:', error);

      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid input',
            details: error.errors,
          },
        });
      }

      const err = error as Error;
      if (err.message === 'CHANNEL_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'CHANNEL_NOT_FOUND',
            message: 'Channel not found',
          },
        });
      }

      if (err.message === 'FORBIDDEN_INSUFFICIENT_PERMISSIONS') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to post in this channel',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create message',
        },
      });
    }
  }
}

export const channelController = new ChannelController();
