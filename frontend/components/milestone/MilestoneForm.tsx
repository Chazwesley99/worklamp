'use client';

import { useState, useEffect } from 'react';
import { Milestone, CreateMilestoneInput, UpdateMilestoneInput } from '@/lib/api/milestone';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface MilestoneFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMilestoneInput | UpdateMilestoneInput) => Promise<void>;
  milestone?: Milestone | null;
  isLoading?: boolean;
}

export default function MilestoneForm({
  isOpen,
  onClose,
  onSubmit,
  milestone,
  isLoading = false,
}: MilestoneFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimatedCompletionDate: '',
    actualCompletionDate: '',
    status: 'planned' as 'planned' | 'in-progress' | 'completed',
    order: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (milestone) {
      setFormData({
        name: milestone.name,
        description: milestone.description || '',
        estimatedCompletionDate: milestone.estimatedCompletionDate.split('T')[0],
        actualCompletionDate: milestone.actualCompletionDate
          ? milestone.actualCompletionDate.split('T')[0]
          : '',
        status: milestone.status,
        order: milestone.order,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        estimatedCompletionDate: '',
        actualCompletionDate: '',
        status: 'planned',
        order: 0,
      });
    }
    setErrors({});
  }, [milestone, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Milestone name is required';
    }

    if (!formData.estimatedCompletionDate) {
      newErrors.estimatedCompletionDate = 'Estimated completion date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const submitData: CreateMilestoneInput | UpdateMilestoneInput = {
        name: formData.name,
        description: formData.description || undefined,
        estimatedCompletionDate: new Date(formData.estimatedCompletionDate).toISOString(),
        status: formData.status,
        order: formData.order,
      };

      if (milestone) {
        // Update mode
        if (formData.actualCompletionDate) {
          (submitData as UpdateMilestoneInput).actualCompletionDate = new Date(
            formData.actualCompletionDate
          ).toISOString();
        }
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting milestone:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={milestone ? 'Edit Milestone' : 'Create Milestone'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Milestone Name"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, name: e.target.value })
          }
          error={errors.name}
          required
          placeholder="e.g., Phase 1 - Foundation"
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe the milestone objectives..."
          rows={3}
        />

        <Input
          label="Estimated Completion Date"
          type="date"
          value={formData.estimatedCompletionDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, estimatedCompletionDate: e.target.value })
          }
          error={errors.estimatedCompletionDate}
          required
        />

        {milestone && (
          <Input
            label="Actual Completion Date"
            type="date"
            value={formData.actualCompletionDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, actualCompletionDate: e.target.value })
            }
          />
        )}

        <Select
          label="Status"
          value={formData.status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({
              ...formData,
              status: e.target.value as 'planned' | 'in-progress' | 'completed',
            })
          }
          options={[
            { value: 'planned', label: 'Planned' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ]}
        />

        <Input
          label="Order"
          type="number"
          value={formData.order}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
          }
          min={0}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : milestone ? 'Update Milestone' : 'Create Milestone'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
