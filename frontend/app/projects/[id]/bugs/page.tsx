'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BugList } from '@/components/bug/BugList';
import { type Bug, bugApi } from '@/lib/api/bug';
import { type Project, projectApi } from '@/lib/api/project';
import { useToast } from '@/lib/contexts/ToastContext';

export default function ProjectBugsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadProjectAndBugs();
  }, [projectId]);

  const loadProjectAndBugs = async () => {
    try {
      setIsLoading(true);
      const [projectData, bugsData] = await Promise.all([
        projectApi.getProject(projectId),
        bugApi.getBugs(projectId),
      ]);
      setProject(projectData);
      setBugs(bugsData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load project data';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBugsChange = () => {
    loadProjectAndBugs();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Project not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{project.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {project.description || 'Track and manage bugs for this project'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <BugList projectId={projectId} bugs={bugs} onBugsChange={handleBugsChange} />
        </div>
      </div>
    </DashboardLayout>
  );
}
