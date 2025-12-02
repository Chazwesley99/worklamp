'use client';

import { useState, useEffect } from 'react';
import {
  FeatureRequest,
  featureApi,
  CreateFeatureInput,
  UpdateFeatureInput,
} from '@/lib/api/feature';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';
import FeatureRequestCard from './FeatureRequestCard';
import FeatureRequestForm from './FeatureRequestForm';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface FeatureRequestListProps {
  projectId: string;
  isPublicView?: boolean;
}

export default function FeatureRequestList({
  projectId,
  isPublicView = false,
}: FeatureRequestListProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [filteredFeatures, setFilteredFeatures] = useState<FeatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureRequest | undefined>();
  const [sortBy, setSortBy] = useState<'votes' | 'priority' | 'recent'>('votes');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [teamMembers] = useState<{ id: string; name: string; email: string }[]>([]);

  useEffect(() => {
    loadFeatures();
  }, [projectId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [features, sortBy, filterStatus]);

  const loadFeatures = async () => {
    try {
      setIsLoading(true);
      const data = await featureApi.getFeatures(projectId);
      setFeatures(data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      showToast(err.response?.data?.error?.message || 'Failed to load requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...features];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((f) => f.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.votes - a.votes;
        case 'priority':
          return b.priority - a.priority;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredFeatures(filtered);
  };

  const handleCreate = async (data: CreateFeatureInput | UpdateFeatureInput) => {
    try {
      if (editingFeature) {
        await featureApi.updateFeature(editingFeature.id, data as UpdateFeatureInput);
        showToast('Request updated successfully', 'success');
      } else {
        await featureApi.createFeature(projectId, data as CreateFeatureInput);
        showToast('Request created successfully', 'success');
      }
      await loadFeatures();
      setIsFormOpen(false);
      setEditingFeature(undefined);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      showToast(err.response?.data?.error?.message || 'Failed to save request', 'error');
      throw error;
    }
  };

  const handleEdit = (feature: FeatureRequest) => {
    setEditingFeature(feature);
    setIsFormOpen(true);
  };

  const handleDelete = async (featureId: string) => {
    try {
      await featureApi.deleteFeature(featureId);
      await loadFeatures();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      throw new Error(err.response?.data?.error?.message || 'Failed to delete request');
    }
  };

  const handleVote = async (featureId: string) => {
    try {
      await featureApi.voteFeature(featureId);
      await loadFeatures();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      throw new Error(err.response?.data?.error?.message || 'Failed to vote');
    }
  };

  const handleOpenForm = () => {
    setEditingFeature(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFeature(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Requests</h2>
        {!isPublicView && user && (
          <Button onClick={handleOpenForm}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Request
          </Button>
        )}
      </div>

      {/* Filters and Sorting */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
          <Select
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSortBy(e.target.value as 'votes' | 'priority' | 'recent')
            }
            className="w-auto"
            options={[
              { value: 'votes', label: 'Most Votes' },
              { value: 'priority', label: 'Priority' },
              { value: 'recent', label: 'Most Recent' },
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
          <Select
            value={filterStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
            className="w-auto"
            options={[
              { value: 'all', label: 'All' },
              { value: 'proposed', label: 'Proposed' },
              { value: 'planned', label: 'Planned' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
        </div>

        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {filteredFeatures.length} request{filteredFeatures.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Feature List */}
      {filteredFeatures.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No requests</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filterStatus !== 'all'
              ? 'No requests match the selected filter.'
              : 'Get started by creating a new request.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFeatures.map((feature) => (
            <FeatureRequestCard
              key={feature.id}
              feature={feature}
              onEdit={!isPublicView ? handleEdit : undefined}
              onDelete={!isPublicView ? handleDelete : undefined}
              onVote={handleVote}
              isPublicView={isPublicView}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <FeatureRequestForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleCreate}
        feature={editingFeature}
        teamMembers={teamMembers}
      />
    </div>
  );
}
