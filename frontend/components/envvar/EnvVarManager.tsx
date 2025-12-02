'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/lib/contexts/ToastContext';
import { getEnvVars, createEnvVar, updateEnvVar, deleteEnvVar, EnvVar } from '@/lib/api/envvar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { CopyButton } from '../ui/CopyButton';

interface EnvVarManagerProps {
  projectId: string;
}

export default function EnvVarManager({ projectId }: EnvVarManagerProps) {
  const [activeTab, setActiveTab] = useState<'development' | 'production'>('development');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEnvVar, setSelectedEnvVar] = useState<EnvVar | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    environment: 'development' as 'development' | 'production',
  });

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch environment variables
  const {
    data: envVars = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['envVars', projectId],
    queryFn: () => getEnvVars(projectId),
  });

  // Filter env vars by active tab
  const filteredEnvVars = envVars.filter((envVar) => envVar.environment === activeTab);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => createEnvVar(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envVars', projectId] });
      showToast('Environment variable created successfully', 'success');
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: Error & { response?: { data?: { error?: { message?: string } } } }) => {
      showToast(
        error.response?.data?.error?.message || 'Failed to create environment variable',
        'error'
      );
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof formData> }) =>
      updateEnvVar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envVars', projectId] });
      showToast('Environment variable updated successfully', 'success');
      setIsEditModalOpen(false);
      setSelectedEnvVar(null);
      resetForm();
    },
    onError: (error: Error & { response?: { data?: { error?: { message?: string } } } }) => {
      showToast(
        error.response?.data?.error?.message || 'Failed to update environment variable',
        'error'
      );
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEnvVar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envVars', projectId] });
      showToast('Environment variable deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      setSelectedEnvVar(null);
    },
    onError: (error: Error & { response?: { data?: { error?: { message?: string } } } }) => {
      showToast(
        error.response?.data?.error?.message || 'Failed to delete environment variable',
        'error'
      );
    },
  });

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      environment: activeTab,
    });
  };

  const handleCreate = () => {
    setFormData({ ...formData, environment: activeTab });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (envVar: EnvVar) => {
    setSelectedEnvVar(envVar);
    setFormData({
      key: envVar.key,
      value: envVar.value,
      environment: envVar.environment,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (envVar: EnvVar) => {
    setSelectedEnvVar(envVar);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEnvVar) {
      updateMutation.mutate({
        id: selectedEnvVar.id,
        data: formData,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (selectedEnvVar) {
      deleteMutation.mutate(selectedEnvVar.id);
    }
  };

  // Show error if user doesn't have permission
  if (error) {
    const apiError = error as Error & { response?: { data?: { error?: { message?: string } } } };
    const errorMessage = apiError.response?.data?.error?.message;
    if (errorMessage?.includes('permission')) {
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Access Denied
          </h3>
          <p className="text-red-600 dark:text-red-300">
            Only admin and owner roles can access environment variables.
          </p>
        </div>
      );
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-end items-center">
        <Button onClick={handleCreate}>Add Variable</Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('development')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'development'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Development
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'production'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Production
          </button>
        </nav>
      </div>

      {/* Environment Variables List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading environment variables...
        </div>
      ) : filteredEnvVars.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No environment variables for {activeTab} environment.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEnvVars.map((envVar) => (
                <tr key={envVar.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      <span>{envVar.key}</span>
                      <CopyButton value={envVar.key} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {envVar.value.substring(0, 20)}
                        {envVar.value.length > 20 ? '...' : ''}
                      </code>
                      <CopyButton value={envVar.value} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {envVar.createdBy.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(envVar.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(envVar)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(envVar)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Add Environment Variable"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <Input
            label="Key"
            value={formData.key}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, key: e.target.value })
            }
            placeholder="API_KEY"
            required
          />
          <Input
            label="Value"
            value={formData.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, value: e.target.value })
            }
            placeholder="your-secret-value"
            required
          />
          <Select
            label="Environment"
            value={formData.environment}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFormData({
                ...formData,
                environment: e.target.value as 'development' | 'production',
              })
            }
            options={[
              { value: 'development', label: 'Development' },
              { value: 'production', label: 'Production' },
            ]}
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEnvVar(null);
          resetForm();
        }}
        title="Edit Environment Variable"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <Input
            label="Key"
            value={formData.key}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, key: e.target.value })
            }
            placeholder="API_KEY"
            required
          />
          <Input
            label="Value"
            value={formData.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, value: e.target.value })
            }
            placeholder="your-secret-value"
            required
          />
          <Select
            label="Environment"
            value={formData.environment}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFormData({
                ...formData,
                environment: e.target.value as 'development' | 'production',
              })
            }
            options={[
              { value: 'development', label: 'Development' },
              { value: 'production', label: 'Production' },
            ]}
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedEnvVar(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedEnvVar(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Environment Variable"
        message={`Are you sure you want to delete "${selectedEnvVar?.key}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
