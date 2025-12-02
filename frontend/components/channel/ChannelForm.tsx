'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';
import { CreateChannelRequest, UpdateChannelRequest } from '@/lib/api/channel';

interface ChannelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChannelRequest | UpdateChannelRequest) => Promise<void>;
  initialData?: {
    name: string;
    description?: string;
    isPrivate: boolean;
  };
  mode: 'create' | 'edit';
}

export function ChannelForm({ isOpen, onClose, onSubmit, initialData, mode }: ChannelFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    isPrivate: initialData?.isPrivate || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: formData.name,
        description: formData.description || undefined,
        isPrivate: formData.isPrivate,
      });
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        isPrivate: false,
      });
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to save channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Channel' : 'Edit Channel'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Channel Name *
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., general, development, design"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What is this channel for?"
            rows={3}
            maxLength={500}
          />
        </div>

        <div>
          <Checkbox
            id="isPrivate"
            checked={formData.isPrivate}
            onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
            label="Private Channel"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
            Private channels require explicit permissions to view and post
          </p>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Channel' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
