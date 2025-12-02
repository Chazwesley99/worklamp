'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectList } from '@/components/project/ProjectList';
import { ProjectForm } from '@/components/project/ProjectForm';
import { TaskList } from '@/components/task/TaskList';
import { type Task, taskApi } from '@/lib/api/task';
import { useProject } from '@/lib/contexts/ProjectContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function DashboardPage() {
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const { selectedProject, refreshProjects } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const { showToast } = useToast();

  // Load tasks when a project is selected
  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject.id);
    }
  }, [selectedProject]);

  const loadTasks = async (projectId: string) => {
    try {
      setIsLoadingTasks(true);
      const data = await taskApi.getTasks(projectId);
      setTasks(data.tasks);
    } catch (error) {
      // Only show error toast if it's not a 404 (no tasks is expected for new projects)
      const message = error instanceof Error ? error.message : 'Failed to load tasks';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleCreateProject = () => {
    setIsProjectFormOpen(true);
  };

  const handleEditProject = () => {
    setIsProjectFormOpen(true);
  };

  const handleTasksChange = () => {
    if (selectedProject) {
      loadTasks(selectedProject.id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Manage your projects and tasks.
          </p>
        </div>

        {/* Tasks Section */}
        {selectedProject ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {isLoadingTasks ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading tasks...
              </div>
            ) : (
              <TaskList
                projectId={selectedProject.id}
                tasks={tasks}
                onTasksChange={handleTasksChange}
              />
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <ProjectList onCreateProject={handleCreateProject} onEditProject={handleEditProject} />
          </div>
        )}

        <ProjectForm
          isOpen={isProjectFormOpen}
          onClose={() => {
            setIsProjectFormOpen(false);
            refreshProjects();
          }}
          project={null}
        />
      </div>
    </DashboardLayout>
  );
}
