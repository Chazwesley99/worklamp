import { prisma } from '../config/database';
import { CreateNoteInput, UpdateNoteInput } from '../validators/note.validator';

export class NoteService {
  /**
   * Get all notes for a user
   */
  async getNotesByUser(userId: string) {
    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return notes;
  }

  /**
   * Get note by ID
   */
  async getNoteById(noteId: string, userId: string) {
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId, // Ensure user can only access their own notes
      },
    });

    if (!note) {
      throw new Error('NOTE_NOT_FOUND');
    }

    return note;
  }

  /**
   * Create a new note
   */
  async createNote(userId: string, data: CreateNoteInput) {
    const note = await prisma.note.create({
      data: {
        userId,
        content: data.content,
        color: data.color,
        positionX: data.positionX,
        positionY: data.positionY,
      },
    });

    return note;
  }

  /**
   * Update note
   */
  async updateNote(noteId: string, userId: string, data: UpdateNoteInput) {
    // Verify note belongs to user
    await this.getNoteById(noteId, userId);

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        content: data.content,
        color: data.color,
        positionX: data.positionX,
        positionY: data.positionY,
      },
    });

    return updatedNote;
  }

  /**
   * Delete note
   */
  async deleteNote(noteId: string, userId: string) {
    // Verify note belongs to user
    await this.getNoteById(noteId, userId);

    await prisma.note.delete({
      where: { id: noteId },
    });

    return { success: true };
  }
}

export const noteService = new NoteService();
