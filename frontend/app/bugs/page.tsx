'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BugList } from '@/components/bug/BugList';
import { type Bug, bugApi } from '@/lib/api/bug';
import { useProject } from '@/lib/contexts/ProjectContext';
import { useToast } from '@/lib/contexts/ToastContext';
import { exportToCSV } from '@/lib/utils/csvExport';

export default function BugsPage() {
  const { selectedProject } = useProject();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (selectedProject) {
      loadBugs(selectedProject.id);
    }
  }, [selectedProject]);

  const loadBugs = async (projectId: string) => {
    try {
      setIsLoading(true);
      const data = await bugApi.getBugs(projectId);
      setBugs(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load bugs';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      setBugs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBugsChange = () => {
    if (selectedProject) {
      loadBugs(selectedProject.id);
    }
  };

  const handleExportCSV = () => {
    const exportData = bugs.map((bug) => ({
      title: bug.title,
      description: bug.description || '',
      status: bug.status,
      priority: bug.priority,
      assignees: bug.assignments.map((a) => a.user.name).join(', ') || 'Unassigned',
      createdBy: bug.createdBy.name,
      votes: bug.votes,
      createdAt: new Date(bug.createdAt).toLocaleDateString(),
      updatedAt: new Date(bug.updatedAt).toLocaleDateString(),
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

    const filename = `${selectedProject?.name || 'project'}-bugs-${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(exportData, headers, filename);
    showToast('Bugs exported successfully', 'success');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bugs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage bugs across your projects
          </p>
        </div>

        {selectedProject ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading bugs...
              </div>
            ) : (
              <BugList
                projectId={selectedProject.id}
                bugs={bugs}
                onBugsChange={handleBugsChange}
                onExport={handleExportCSV}
              />
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">No project selected</p>
              <p className="text-sm">Select a project from the dropdown to view bugs</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
