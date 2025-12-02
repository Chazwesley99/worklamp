'use client';

import { useState, useEffect } from 'react';
import { FeatureRequest, CreateFeatureInput, UpdateFeatureInput } from '@/lib/api/feature';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface FeatureRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFeatureInput | UpdateFeatureInput) => Promise<void>;
  feature?: FeatureRequest;
  teamMembers?: { id: string; name: string; email: string }[];
}

export default function FeatureRequestForm({
  isOpen,
  onClose,
  onSubmit,
  feature,
  teamMembers = [],
}: FeatureRequestFormProps) {
  const [formData, setFormData] = useState<CreateFeatureInput>({
    title: '',
    description: '',
    priority: 0,
    status: 'proposed',
    ownerId: undefined,
    assignedUserIds: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (feature) {
      setFormData({
        title: feature.title,
        description: feature.description,
        priority: feature.priority,
        status: feature.status,
        ownerId: feature.ownerId || undefined,
        assignedUserIds: feature.assignments.map((a) => a.userId),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 0,
        status: 'proposed',
        ownerId: undefined,
        assignedUserIds: [],
      });
    }
    setErrors({});
  }, [feature, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must be 5000 characters or less';
    }

    if (formData.priority !== undefined && (formData.priority < 0 || formData.priority > 100)) {
      newErrors.priority = 'Priority must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting feature request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignedUsersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedUserIds = selectedOptions.map((option: HTMLOptionElement) => option.value);
    setFormData({ ...formData, assignedUserIds: selectedUserIds });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={feature ? 'Edit Request' : 'New Request'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, title: e.target.value })
          }
          error={errors.title}
          required
          placeholder="Enter request title"
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, description: e.target.value })
          }
          error={errors.description}
          required
          rows={6}
          placeholder="Describe the request in detail"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Priority"
            type="number"
            min={0}
            max={100}
            value={formData.priority}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
            }
            error={errors.priority}
            placeholder="0-100"
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFormData({
                ...formData,
                status: e.target.value as CreateFeatureInput['status'],
              })
            }
            options={[
              { value: 'proposed', label: 'Proposed' },
              { value: 'planned', label: 'Planned' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
        </div>

        {teamMembers.length > 0 && (
          <>
            <Select
              label="Owner"
              value={formData.ownerId || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, ownerId: e.target.value || undefined })
              }
              options={[
                { value: '', label: 'No owner' },
                ...teamMembers.map((member) => ({
                  value: member.id,
                  label: `${member.name} (${member.email})`,
                })),
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assigned Users
              </label>
              <select
                multiple
                value={formData.assignedUserIds}
                onChange={handleAssignedUsersChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                size={Math.min(teamMembers.length, 5)}
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Hold Ctrl/Cmd to select multiple users
              </p>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : feature ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
