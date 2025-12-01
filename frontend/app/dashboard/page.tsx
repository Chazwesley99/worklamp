'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectList } from '@/components/project/ProjectList';
import { ProjectForm } from '@/components/project/ProjectForm';
import { type Project } from '@/lib/api/project';

export default function DashboardPage() {
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsProjectFormOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsProjectFormOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's an overview of your projects.
          </p>
        </div>

        <ProjectList onCreateProject={handleCreateProject} onEditProject={handleEditProject} />

        <ProjectForm
          isOpen={isProjectFormOpen}
          onClose={() => setIsProjectFormOpen(false)}
          project={selectedProject}
        />
      </div>
    </DashboardLayout>
  );
}
