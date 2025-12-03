'use client';

import { useState, useEffect } from 'react';
import { noteApi, Note, CreateNoteRequest, UpdateNoteRequest } from '@/lib/api/note';
import { useToast } from '@/lib/contexts/ToastContext';
import { NoteCard } from '@/components/note/NoteCard';
import { NoteForm } from '@/components/note/NoteForm';

export function UserNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await noteApi.getNotes();
      setNotes(response.notes);
    } catch (error) {
      console.error('Failed to load notes:', error);
      showToast('Failed to load notes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (data: CreateNoteRequest) => {
    try {
      const response = await noteApi.createNote(data);
      setNotes([response.note, ...notes]);
      setShowForm(false);
      showToast('Note created successfully', 'success');
    } catch (error) {
      console.error('Failed to create note:', error);
      showToast('Failed to create note', 'error');
      throw error;
    }
  };

  const handleUpdateNote = async (noteId: string, data: UpdateNoteRequest) => {
    try {
      const response = await noteApi.updateNote(noteId, data);
      setNotes(notes.map((note) => (note.id === noteId ? response.note : note)));
      setEditingNote(null);
      showToast('Note updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update note:', error);
      showToast('Failed to update note', 'error');
      throw error;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await noteApi.deleteNote(noteId);
      setNotes(notes.filter((note) => note.id !== noteId));
      showToast('Note deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete note:', error);
      showToast('Failed to delete note', 'error');
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Notes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-md text-sm font-medium transition-colors"
        >
          + Add Note
        </button>
      </div>

      {showForm && (
        <NoteForm
          note={editingNote}
          onSubmit={
            editingNote
              ? async (data) => await handleUpdateNote(editingNote.id, data as UpdateNoteRequest)
              : async (data) => await handleCreateNote(data as CreateNoteRequest)
          }
          onCancel={handleCloseForm}
        />
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No notes yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Create your first note to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onUpdate={handleUpdateNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
