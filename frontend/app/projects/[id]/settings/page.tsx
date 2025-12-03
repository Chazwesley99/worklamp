'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi, type UpdateProjectRequest } from '@/lib/api/project';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.id as string;

  const [formData, setFormData] = useState<UpdateProjectRequest>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getProject(projectId),
    enabled: !!projectId,
  });

  // Initialize form data when project loads
  React.useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        publicBugTracking: project.publicBugTracking,
        publicFeatureRequests: project.publicFeatureRequests,
        useMilestones: project.useMilestones,
      });
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProjectRequest) => projectApi.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setErrors({ success: 'Project updated successfully' });
    },
    onError: (error: unknown) => {
      const apiError = error as { error?: { message?: string } };
      setErrors({ general: apiError.error?.message || 'Failed to update project' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectApi.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      const apiError = error as { error?: { message?: string } };
      setErrors({ general: apiError.error?.message || 'Failed to delete project' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Project Not Found
          </h1>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <a
          href="/projects"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </a>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Project Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your project configuration and settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md">
            {errors.success}
          </div>
        )}

        {errors.general && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
            {errors.general}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Basic Information
          </h2>

          <Input
            label="Project Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            disabled={updateMutation.isPending}
            required
          />

          <Textarea
            label="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={updateMutation.isPending}
            rows={4}
          />

          <Select
            label="Status"
            value={formData.status || 'active'}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as 'active' | 'completed' | 'archived',
              })
            }
            options={[
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'archived', label: 'Archived' },
            ]}
            disabled={updateMutation.isPending}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Project Features
          </h2>

          <div>
            <Checkbox
              label="Enable milestones"
              checked={formData.useMilestones || false}
              onChange={(e) => setFormData({ ...formData, useMilestones: e.target.checked })}
              disabled={updateMutation.isPending}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-6 mt-1">
              Track project progress with milestones and change orders
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Public Access</h2>

          <Checkbox
            label="Enable public bug tracking"
            checked={formData.publicBugTracking || false}
            onChange={(e) => setFormData({ ...formData, publicBugTracking: e.target.checked })}
            disabled={updateMutation.isPending}
          />

          <Checkbox
            label="Enable public feature requests"
            checked={formData.publicFeatureRequests || false}
            onChange={(e) => setFormData({ ...formData, publicFeatureRequests: e.target.checked })}
            disabled={updateMutation.isPending}
          />
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>

      <div className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Deleting a project is permanent and cannot be undone. All tasks, bugs, and features
          associated with this project will be deleted.
        </p>

        {!showDeleteConfirm ? (
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            Delete Project
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleDelete} isLoading={deleteMutation.isPending}>
                Yes, Delete Project
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
