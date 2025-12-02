'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/lib/contexts/ToastContext';
import {
  getUserEnvVars,
  createUserEnvVar,
  updateUserEnvVar,
  deleteUserEnvVar,
  UserEnvVar,
} from '@/lib/api/userenvvar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { CopyButton } from '../ui/CopyButton';

export default function UserEnvVarManager() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEnvVar, setSelectedEnvVar] = useState<UserEnvVar | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
  });

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch environment variables
  const { data: envVars = [], isLoading } = useQuery({
    queryKey: ['userEnvVars'],
    queryFn: getUserEnvVars,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => createUserEnvVar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userEnvVars'] });
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
      updateUserEnvVar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userEnvVars'] });
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
    mutationFn: (id: string) => deleteUserEnvVar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userEnvVars'] });
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
    });
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (envVar: UserEnvVar) => {
    setSelectedEnvVar(envVar);
    setFormData({
      key: envVar.key,
      value: envVar.value,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (envVar: UserEnvVar) => {
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-end items-center">
        <Button onClick={handleCreate}>Add Variable</Button>
      </div>

      {/* Environment Variables List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading environment variables...
        </div>
      ) : envVars.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No personal environment variables yet.
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
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {envVars.map((envVar) => (
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
        title="Add Personal Variable"
      >
        <form onSubmit={handleSubmitCreate} className="space-y-4">
          <Input
            label="Key"
            value={formData.key}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, key: e.target.value })
            }
            placeholder="MY_API_KEY"
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
        title="Edit Personal Variable"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <Input
            label="Key"
            value={formData.key}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, key: e.target.value })
            }
            placeholder="MY_API_KEY"
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
        title="Delete Personal Variable"
        message={`Are you sure you want to delete "${selectedEnvVar?.key}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
