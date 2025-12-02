'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import FeatureRequestList from '@/components/feature/FeatureRequestList';
import { type FeatureRequest, featureApi } from '@/lib/api/feature';
import { useProject } from '@/lib/contexts/ProjectContext';
import { useToast } from '@/lib/contexts/ToastContext';
import { exportToCSV } from '@/lib/utils/csvExport';

export default function FeaturesPage() {
  const { selectedProject } = useProject();
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (selectedProject) {
      loadFeatures(selectedProject.id);
    }
  }, [selectedProject]);

  const loadFeatures = async (projectId: string) => {
    try {
      setIsLoading(true);
      const data = await featureApi.getFeatures(projectId);
      setFeatures(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load feature requests';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      setFeatures([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeaturesChange = () => {
    if (selectedProject) {
      loadFeatures(selectedProject.id);
    }
  };

  const handleExportCSV = () => {
    const exportData = features.map((feature) => ({
      title: feature.title,
      description: feature.description || '',
      status: feature.status,
      priority: feature.priority,
      assignees: feature.assignments.map((a) => a.user.name).join(', ') || 'Unassigned',
      createdBy: feature.createdBy.name,
      votes: feature.votes,
      createdAt: new Date(feature.createdAt).toLocaleDateString(),
      updatedAt: new Date(feature.updatedAt).toLocaleDateString(),
    }));

    const headers = [
      { key: 'title' as const, label: 'Title' },
      { key: 'description' as const, label: 'Description' },
      { key: 'status' as const, label: 'Status' },
      { key: 'priority' as const, label: 'Priority' },
      { key: 'assignees' as const, label: 'Assignees' },
      { key: 'createdBy' as const, label: 'Created By' },
      { key: 'votes' as const, label: 'Votes' },
      { key: 'createdAt' as const, label: 'Created' },
      { key: 'updatedAt' as const, label: 'Updated' },
    ];

    const filename = `${selectedProject?.name || 'project'}-features-${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(exportData, headers, filename);
    showToast('Feature requests exported successfully', 'success');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Feature Requests</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage feature requests across your projects
          </p>
        </div>

        {selectedProject ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading feature requests...
              </div>
            ) : (
              <FeatureRequestList
                projectId={selectedProject.id}
                features={features}
                onFeaturesChange={handleFeaturesChange}
                onExport={handleExportCSV}
              />
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">No project selected</p>
              <p className="text-sm">Select a project from the dropdown to view feature requests</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
