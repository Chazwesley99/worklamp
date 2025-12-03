import { apiClient } from '../api';

export interface Note {
  id: string;
  userId: string;
  content: string;
  color: string | null;
  positionX: number | null;
  positionY: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  content: string;
  color?: string | null;
  positionX?: number | null;
  positionY?: number | null;
}

export interface UpdateNoteRequest {
  content?: string;
  color?: string | null;
  positionX?: number | null;
  positionY?: number | null;
}

export const noteApi = {
  /**
   * Get all notes for the authenticated user
   */
  async getNotes(): Promise<{ notes: Note[] }> {
    return apiClient.get<{ notes: Note[] }>('/api/notes');
  },

  /**
   * Create new note
   */
  async createNote(data: CreateNoteRequest): Promise<{ note: Note }> {
    return apiClient.post<{ note: Note }>('/api/notes', data);
  },

  /**
   * Update note
   */
  async updateNote(noteId: string, data: UpdateNoteRequest): Promise<{ note: Note }> {
    return apiClient.patch<{ note: Note }>(`/api/notes/${noteId}`, data);
  },

  /**
   * Delete note
   */
  async deleteNote(noteId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/api/notes/${noteId}`);
  },
};
