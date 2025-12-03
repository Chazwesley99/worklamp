'use client';

import { useState, useEffect } from 'react';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '@/lib/api/note';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';

interface NoteFormProps {
  note?: Note | null;
  onSubmit: (data: CreateNoteRequest | UpdateNoteRequest) => Promise<void>;
  onCancel: () => void;
}

const NOTE_COLORS = [
  { name: 'yellow', label: 'Yellow', bg: 'bg-yellow-200' },
  { name: 'pink', label: 'Pink', bg: 'bg-pink-200' },
  { name: 'blue', label: 'Blue', bg: 'bg-blue-200' },
  { name: 'green', label: 'Green', bg: 'bg-green-200' },
  { name: 'purple', label: 'Purple', bg: 'bg-purple-200' },
  { name: 'orange', label: 'Orange', bg: 'bg-orange-200' },
];

export function NoteForm({ note, onSubmit, onCancel }: NoteFormProps) {
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState(note?.color || 'yellow');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setColor(note.color || 'yellow');
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Note content is required');
      return;
    }

    if (content.length > 1000) {
      setError('Note content is too long (max 1000 characters)');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        content: content.trim(),
        color,
      });
    } catch (err) {
      setError('Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title={note ? 'Edit Note' : 'Create Note'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Note Content
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
            rows={6}
            maxLength={1000}
            className="w-full"
            autoFocus
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {content.length} / 1000 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="flex gap-2">
            {NOTE_COLORS.map((noteColor) => (
              <button
                key={noteColor.name}
                type="button"
                onClick={() => setColor(noteColor.name)}
                className={`w-12 h-12 rounded-lg border-2 ${
                  color === noteColor.name
                    ? 'border-gray-900 dark:border-white'
                    : 'border-gray-300 dark:border-gray-600'
                } ${noteColor.bg} hover:border-gray-600 dark:hover:border-gray-400 transition-colors`}
                title={noteColor.label}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
