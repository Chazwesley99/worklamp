import { Request, Response } from 'express';
import { noteService } from '../services/note.service';
import { createNoteSchema, updateNoteSchema } from '../validators/note.validator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class NoteController {
  /**
   * GET /api/notes
   * Get all notes for the authenticated user
   */
  async getNotes(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;

      const notes = await noteService.getNotesByUser(userId);

      res.json({ notes });
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notes',
        },
      });
    }
  }

  /**
   * POST /api/notes
   * Create a new note
   */
  async createNote(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;

      const validatedData = createNoteSchema.parse(req.body);

      const note = await noteService.createNote(userId, validatedData);

      res.status(201).json({ note });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors,
          },
        });
      }

      console.error('Error creating note:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create note',
        },
      });
    }
  }

  /**
   * PATCH /api/notes/:id
   * Update a note
   */
  async updateNote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;

      const validatedData = updateNoteSchema.parse(req.body);

      const note = await noteService.updateNote(id, userId, validatedData);

      res.json({ note });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors,
          },
        });
      }

      if (error.message === 'NOTE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOTE_NOT_FOUND',
            message: 'Note not found',
          },
        });
      }

      console.error('Error updating note:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update note',
        },
      });
    }
  }

  /**
   * DELETE /api/notes/:id
   * Delete a note
   */
  async deleteNote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.userId;

      await noteService.deleteNote(id, userId);

      res.json({ success: true });
    } catch (error: any) {
      if (error.message === 'NOTE_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'NOTE_NOT_FOUND',
            message: 'Note not found',
          },
        });
      }

      console.error('Error deleting note:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete note',
        },
      });
    }
  }
}

export const noteController = new NoteController();
