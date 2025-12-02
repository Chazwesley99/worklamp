'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi, type Project, type CreateProjectRequest } from '@/lib/api/project';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

export function ProjectForm({ isOpen, onClose, project }: ProjectFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    publicBugTracking: false,
    publicFeatureRequests: false,
    useMilestones: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData({
          name: project.name,
          description: project.description || '',
          publicBugTracking: project.publicBugTracking,
          publicFeatureRequests: project.publicFeatureRequests,
          useMilestones: project.useMilestones || false,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          publicBugTracking: false,
          publicFeatureRequests: false,
          useMilestones: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, project]);

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
    onError: (error: unknown) => {
      const apiError = error as { error?: { code?: string; message?: string } };
      if (apiError.error?.code === 'VALIDATION_FAILED') {
        setErrors({ general: apiError.error.message || 'Validation failed' });
      } else if (apiError.error?.code === 'LIMIT_EXCEEDED_PROJECTS') {
        setErrors({ general: 'Project limit reached for your subscription tier' });
      } else {
        setErrors({ general: 'Failed to create project. Please try again.' });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectApi.updateProject(project!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project!.id] });
      onClose();
    },
    onError: (error: unknown) => {
      const apiError = error as { error?: { code?: string; message?: string } };
      if (apiError.error?.code === 'VALIDATION_FAILED') {
        setErrors({ general: apiError.error.message || 'Validation failed' });
      } else {
        setErrors({ general: 'Failed to update project. Please try again.' });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (project) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Project' : 'Create New Project'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
            {errors.general}
          </div>
        )}

        <Input
          label="Project Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="Enter project name"
          disabled={isLoading}
          required
        />

        <Textarea
          label="Description (optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter project description"
          disabled={isLoading}
          rows={4}
        />

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Features
            </p>
            <Checkbox
              label="Enable milestones"
              checked={formData.useMilestones}
              onChange={(e) => setFormData({ ...formData, useMilestones: e.target.checked })}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
              Track project progress with milestones and change orders
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Public Access
            </p>
            <Checkbox
              label="Enable public bug tracking"
              checked={formData.publicBugTracking}
              onChange={(e) => setFormData({ ...formData, publicBugTracking: e.target.checked })}
              disabled={isLoading}
            />
            <Checkbox
              label="Enable public feature requests"
              checked={formData.publicFeatureRequests}
              onChange={(e) =>
                setFormData({ ...formData, publicFeatureRequests: e.target.checked })
              }
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
