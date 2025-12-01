'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectList } from '@/components/project/ProjectList';
import { ProjectForm } from '@/components/project/ProjectForm';
import { type Project } from '@/lib/api/project';

export default function ProjectsPage() {
  const router = useRouter();
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

  const handleSelectProject = (project: Project) => {
    router.push(`/projects/${project.id}/settings`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your projects and their settings.
          </p>
        </div>

        <ProjectList
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
          onSelectProject={handleSelectProject}
        />

        <ProjectForm
          isOpen={isProjectFormOpen}
          onClose={() => setIsProjectFormOpen(false)}
          project={selectedProject}
        />
      </div>
    </DashboardLayout>
  );
}
