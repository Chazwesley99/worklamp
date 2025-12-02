'use client';

import { useState, useEffect, useRef } from 'react';
import { Bug, CreateBugRequest, UpdateBugRequest } from '@/lib/api/bug';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { AIAssistantPanel } from '../ai/AIAssistantPanel';

interface BugFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBugRequest | UpdateBugRequest, imageFile?: File) => Promise<void>;
  bug?: Bug | null;
  projectId: string;
  teamMembers?: Array<{ id: string; name: string; email: string }>;
}

export function BugForm({ isOpen, onClose, onSubmit, bug, teamMembers = [] }: BugFormProps) {
  const [formData, setFormData] = useState<CreateBugRequest>({
    title: '',
    description: '',
    url: '',
    priority: 0,
    status: 'open',
    ownerId: null,
    assignedUserIds: [],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bug) {
      setFormData({
        title: bug.title,
        description: bug.description,
        url: bug.url || '',
        priority: bug.priority,
        status: bug.status,
        ownerId: bug.ownerId,
        assignedUserIds: bug.assignments.map((a) => a.userId),
      });
      setImagePreview(bug.imageUrl || null);
      setImageFile(null);
    } else {
      setFormData({
        title: '',
        description: '',
        url: '',
        priority: 0,
        status: 'open',
        ownerId: null,
        assignedUserIds: [],
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setError(null);
  }, [bug, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData, imageFile || undefined);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save bug';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignmentChange = (userId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      assignedUserIds: checked
        ? [...(prev.assignedUserIds || []), userId]
        : (prev.assignedUserIds || []).filter((id) => id !== userId),
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={bug ? 'Edit Bug' : 'Report Bug'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Brief description of the bug"
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          placeholder="Detailed description of the bug, steps to reproduce, expected vs actual behavior"
          rows={4}
        />

        {/* AI Assistant Toggle */}
        {formData.title && formData.description && (
          <div>
            <button
              type="button"
              onClick={() => setShowAI(!showAI)}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showAI ? 'rotate-90' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
              {showAI ? 'Hide' : 'Show'} AI Assistant
            </button>
            {showAI && (
              <div className="mt-3">
                <AIAssistantPanel
                  type="bug"
                  title={formData.title}
                  description={formData.description}
                  url={formData.url || undefined}
                  imageUrl={imagePreview || undefined}
                />
              </div>
            )}
          </div>
        )}

        <Input
          label="URL (optional)"
          type="url"
          value={formData.url || ''}
          onChange={(e) => setFormData({ ...formData, url: e.target.value || null })}
          placeholder="https://example.com/page-with-bug"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Screenshot (optional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700 focus:outline-none"
          />
          {imagePreview && (
            <div className="mt-2 relative inline-block">
              <img
                src={imagePreview}
                alt="Bug screenshot preview"
                className="max-w-xs rounded border border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Priority (0-100)"
            type="number"
            min="0"
            max="100"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as 'open' | 'in-progress' | 'resolved' | 'closed',
              })
            }
            options={[
              { value: 'open', label: 'Open' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
        </div>

        {teamMembers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign to
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded p-2">
              {teamMembers.map((member) => (
                <label key={member.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData.assignedUserIds || []).includes(member.id)}
                    onChange={(e) => handleAssignmentChange(member.id, e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">{member.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{member.email}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : bug ? 'Update Bug' : 'Report Bug'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
