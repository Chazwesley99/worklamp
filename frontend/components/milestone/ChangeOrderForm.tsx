'use client';

import { useState, useEffect } from 'react';
import {
  ChangeOrder,
  CreateChangeOrderInput,
  UpdateChangeOrderInput,
  Milestone,
} from '@/lib/api/milestone';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface ChangeOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChangeOrderInput | UpdateChangeOrderInput) => Promise<void>;
  changeOrder?: ChangeOrder | null;
  milestones?: Milestone[];
  isLoading?: boolean;
}

export default function ChangeOrderForm({
  isOpen,
  onClose,
  onSubmit,
  changeOrder,
  milestones = [],
  isLoading = false,
}: ChangeOrderFormProps) {
  const [formData, setFormData] = useState({
    milestoneId: '',
    title: '',
    description: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter to only show locked milestones
  const lockedMilestones = milestones.filter((m) => m.isLocked);

  useEffect(() => {
    if (changeOrder) {
      setFormData({
        milestoneId: changeOrder.milestoneId,
        title: changeOrder.title,
        description: changeOrder.description,
        status: changeOrder.status,
      });
    } else {
      const locked = milestones.filter((m) => m.isLocked);
      setFormData({
        milestoneId: locked.length > 0 ? locked[0].id : '',
        title: '',
        description: '',
        status: 'pending',
      });
    }
    setErrors({});
  }, [changeOrder, isOpen, milestones]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!changeOrder && !formData.milestoneId) {
      newErrors.milestoneId = 'Milestone is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
      if (changeOrder) {
        // Update mode - don't send milestoneId
        await onSubmit({
          title: formData.title,
          description: formData.description,
          status: formData.status,
        });
      } else {
        // Create mode
        await onSubmit({
          milestoneId: formData.milestoneId,
          title: formData.title,
          description: formData.description,
          status: formData.status,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error submitting change order:', error);
    }
  };

  if (!changeOrder && lockedMilestones.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Create Change Order">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No locked milestones available. You must lock a milestone before creating change orders.
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={changeOrder ? 'Edit Change Order' : 'Create Change Order'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!changeOrder && (
          <Select
            label="Milestone"
            value={formData.milestoneId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFormData({ ...formData, milestoneId: e.target.value })
            }
            error={errors.milestoneId}
            required
            options={[
              { value: '', label: 'Select a locked milestone' },
              ...lockedMilestones.map((milestone) => ({
                value: milestone.id,
                label: milestone.name,
              })),
            ]}
          />
        )}

        <Input
          label="Title"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, title: e.target.value })
          }
          error={errors.title}
          required
          placeholder="e.g., Additional API Integration"
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, description: e.target.value })
          }
          error={errors.description}
          required
          placeholder="Describe the change order in detail..."
          rows={4}
        />

        <Select
          label="Status"
          value={formData.status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({
              ...formData,
              status: e.target.value as 'pending' | 'approved' | 'rejected',
            })
          }
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : changeOrder ? 'Update Change Order' : 'Create Change Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
