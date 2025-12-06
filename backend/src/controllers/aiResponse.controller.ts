import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const aiResponseController = {
  /**
   * Save an AI response
   */
  async saveResponse(req: Request, res: Response) {
    try {
      const { resourceType, resourceId, responseData } = req.body;

      if (!resourceType || !resourceId || !responseData) {
        return res.status(400).json({
          error: { message: 'resourceType, resourceId, and responseData are required' },
        });
      }

      if (!['task', 'bug', 'feature'].includes(resourceType)) {
        return res.status(400).json({
          error: { message: 'resourceType must be task, bug, or feature' },
        });
      }

      const aiResponse = await prisma.aIResponse.create({
        data: {
          resourceType,
          resourceId,
          responseData,
        },
      });

      res.status(201).json(aiResponse);
    } catch (error) {
      console.error('Error saving AI response:', error);
      res.status(500).json({ error: { message: 'Failed to save AI response' } });
    }
  },

  /**
   * Get AI responses for a resource
   */
  async getResponses(req: Request, res: Response) {
    try {
      const { resourceType, resourceId } = req.params;

      if (!resourceType || !resourceId) {
        return res.status(400).json({
          error: { message: 'resourceType and resourceId are required' },
        });
      }

      if (!['task', 'bug', 'feature'].includes(resourceType)) {
        return res.status(400).json({
          error: { message: 'resourceType must be task, bug, or feature' },
        });
      }

      const responses = await prisma.aIResponse.findMany({
        where: {
          resourceType,
          resourceId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(responses);
    } catch (error) {
      console.error('Error fetching AI responses:', error);
      res.status(500).json({ error: { message: 'Failed to fetch AI responses' } });
    }
  },

  /**
   * Delete an AI response
   */
  async deleteResponse(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.aIResponse.delete({
        where: { id },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting AI response:', error);
      res.status(500).json({ error: { message: 'Failed to delete AI response' } });
    }
  },
};
