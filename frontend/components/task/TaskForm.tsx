'use client';

import { useState, useEffect } from 'react';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/lib/api/task';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

// Default recommended categories for task organization
const DEFAULT_CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'API',
  'UI/UX',
  'Testing',
  'Documentation',
  'DevOps',
  'Bug Fix',
  'Feature',
  'Refactoring',
  'Security',
  'Performance',
  'Research',
];

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
  task?: Task | null;
  projectId: string;
  milestones?: Array<{ id: string; name: string }>;
  teamMembers?: Array<{ id: string; name: string; email: string }>;
  existingCategories?: string[];
}

export function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  task,
  milestones = [],
  teamMembers = [],
  existingCategories = [],
}: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    category: '',
    priority: 0,
    status: 'todo',
    milestoneId: null,
    ownerId: null,
    assignedUserIds: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [tempCustomCategories, setTempCustomCategories] = useState<string[]>([]);

  // Combine default categories with existing custom categories from the project
  // Also include any temporarily created categories in this session
  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...existingCategories.filter((cat) => !DEFAULT_CATEGORIES.includes(cat)),
    ...tempCustomCategories.filter(
      (cat) => !DEFAULT_CATEGORIES.includes(cat) && !existingCategories.includes(cat)
    ),
  ].sort();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category || '',
        priority: task.priority,
        status: task.status,
        milestoneId: task.milestoneId,
        ownerId: task.ownerId,
        assignedUserIds: task.assignments.map((a) => a.userId),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 0,
        status: 'todo',
        milestoneId: null,
        ownerId: null,
        assignedUserIds: [],
      });
    }
    setError(null);
    setShowCustomCategory(false);
    setCustomCategory('');
    // Reset temp categories when modal opens/closes
    if (!isOpen) {
      setTempCustomCategories([]);
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save task';
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

  const handleCategorySelect = (category: string) => {
    if (category === '__custom__') {
      setShowCustomCategory(true);
      setFormData({ ...formData, category: '' });
    } else {
      setShowCustomCategory(false);
      setFormData({ ...formData, category });
    }
  };

  const handleCustomCategorySubmit = () => {
    if (customCategory.trim()) {
      const newCategory = customCategory.trim();
      // Add to temporary categories so it appears in the dropdown
      setTempCustomCategories((prev) => [...prev, newCategory]);
      // Set it as the selected category
      setFormData({ ...formData, category: newCategory });
      // Hide the custom input and show the dropdown with the new category selected
      setShowCustomCategory(false);
      setCustomCategory('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Create Task'}>
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
          placeholder="Enter task title"
        />

        <Textarea
          label="Description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter task description (optional)"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            {showCustomCategory ? (
              <div className="flex gap-2">
                <Input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCustomCategorySubmit();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCustomCategorySubmit}
                  disabled={!customCategory.trim()}
                >
                  ✓
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCustomCategory('');
                  }}
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Select
                value={formData.category || ''}
                onChange={(e) => handleCategorySelect(e.target.value)}
                options={[
                  { value: '', label: 'No category' },
                  ...allCategories.map((cat) => ({ value: cat, label: cat })),
                  { value: '__custom__', label: '+ Create custom category' },
                ]}
              />
            )}
          </div>

          <Input
            label="Priority (0-100)"
            type="number"
            min="0"
            max="100"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as 'todo' | 'in-progress' | 'done',
              })
            }
            options={[
              { value: 'todo', label: 'To Do' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'done', label: 'Done' },
            ]}
          />

          {milestones.length > 0 && (
            <Select
              label="Milestone"
              value={formData.milestoneId || ''}
              onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value || null })}
              options={[
                { value: '', label: 'No milestone' },
                ...milestones.map((milestone) => ({
                  value: milestone.id,
                  label: milestone.name,
                })),
              ]}
            />
          )}
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
            {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
