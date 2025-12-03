'use client';

import { Note, UpdateNoteRequest } from '@/lib/api/note';
import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onUpdate: (noteId: string, data: UpdateNoteRequest) => void;
}

const NOTE_COLORS = [
  { name: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-300', text: 'text-gray-900' },
  { name: 'pink', bg: 'bg-pink-200', border: 'border-pink-300', text: 'text-gray-900' },
  { name: 'blue', bg: 'bg-blue-200', border: 'border-blue-300', text: 'text-gray-900' },
  { name: 'green', bg: 'bg-green-200', border: 'border-green-300', text: 'text-gray-900' },
  { name: 'purple', bg: 'bg-purple-200', border: 'border-purple-300', text: 'text-gray-900' },
  { name: 'orange', bg: 'bg-orange-200', border: 'border-orange-300', text: 'text-gray-900' },
];

export function NoteCard({ note, onEdit, onDelete, onUpdate }: NoteCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const currentColor = NOTE_COLORS.find((c) => c.name === note.color) || NOTE_COLORS[0];

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    await onDelete(note.id);
    setShowDeleteConfirm(false);
  };

  const handleColorChange = async (colorName: string) => {
    try {
      await onUpdate(note.id, { color: colorName });
      setShowColorPicker(false);
    } catch (error) {
      console.error('Failed to update note color:', error);
    }
  };

  return (
    <div
      className={`${currentColor.bg} ${currentColor.border} ${currentColor.text} rounded-lg border-2 p-4 shadow-md hover:shadow-lg transition-shadow relative min-h-[200px] flex flex-col`}
      style={{
        transform: 'rotate(-1deg)',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'rotate(-1deg) scale(1)';
      }}
    >
      {/* Top bar with actions */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-400/30">
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-6 h-6 rounded-full border-2 border-gray-400 hover:border-gray-600 transition-colors"
            style={{ backgroundColor: currentColor.bg.replace('bg-', '') }}
            title="Change color"
          >
            🎨
          </button>

          {showColorPicker && (
            <div className="absolute top-8 left-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex gap-2">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color.name === note.color ? 'border-gray-900' : 'border-gray-300'
                  } hover:border-gray-600 transition-colors ${color.bg}`}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(note)}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            title="Edit note"
          >
            ✏️
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            title="Delete note"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Note content */}
      <div className="flex-1 overflow-auto">
        <p className="text-sm whitespace-pre-wrap break-words font-handwriting leading-relaxed">
          {note.content}
        </p>
      </div>

      {/* Timestamp */}
      <div className="mt-3 pt-2 border-t border-gray-400/30">
        <p className="text-xs opacity-60">{new Date(note.createdAt).toLocaleDateString()}</p>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
