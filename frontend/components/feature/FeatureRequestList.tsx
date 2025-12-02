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
  features: FeatureRequest[];
  onFeaturesChange: () => void;
  isPublicView?: boolean;
}

export default function FeatureRequestList({
  projectId,
  features,
  onFeaturesChange,
  isPublicView = false,
}: FeatureRequestListProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [filteredFeatures, setFilteredFeatures] = useState<FeatureRequest[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureRequest | undefined>();
  const [sortBy, setSortBy] = useState<'votes' | 'priority' | 'recent'>('votes');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [teamMembers] = useState<{ id: string; name: string; email: string }[]>([]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [features, sortBy, filterStatus]);

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
      onFeaturesChange();
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
      showToast('Request deleted successfully', 'success');
      onFeaturesChange();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      showToast(err.response?.data?.error?.message || 'Failed to delete request', 'error');
      throw error;
    }
  };

  const handleVote = async (featureId: string) => {
    try {
      await featureApi.voteFeature(featureId);
      onFeaturesChange();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      showToast(err.response?.data?.error?.message || 'Failed to vote', 'error');
      throw error;
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Requests</h2>
        {!isPublicView && user && <Button onClick={handleOpenForm}>+ New Request</Button>}
      </div>

      {/* Filters and Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select
          value={sortBy}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSortBy(e.target.value as 'votes' | 'priority' | 'recent')
          }
          options={[
            { value: 'votes', label: 'Sort by Votes' },
            { value: 'priority', label: 'Sort by Priority' },
            { value: 'recent', label: 'Sort by Recent' },
          ]}
        />

        <Select
          value={filterStatus}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'proposed', label: 'Proposed' },
            { value: 'planned', label: 'Planned' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />

        <div className="flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
          {filteredFeatures.length} request{filteredFeatures.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Feature List */}
      {filteredFeatures.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {features.length === 0 ? (
            <>
              <p className="text-lg mb-2">No feature requests yet</p>
              <p className="text-sm">Create your first feature request to get started</p>
            </>
          ) : (
            <p>No requests match your filters</p>
          )}
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
