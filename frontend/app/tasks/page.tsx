'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TaskList } from '@/components/task/TaskList';
import { type Task, taskApi } from '@/lib/api/task';
import { milestoneApi, type Milestone } from '@/lib/api/milestone';
import { useProject } from '@/lib/contexts/ProjectContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function TasksPage() {
  const { selectedProject, projects, isLoading: projectsLoading } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject.id);
      // Only load milestones if enabled for this project
      if (selectedProject.useMilestones) {
        loadMilestones(selectedProject.id);
      } else {
        setMilestones([]);
      }
    }
  }, [selectedProject]);

  const loadTasks = async (projectId: string) => {
    try {
      setIsLoading(true);
      const data = await taskApi.getTasks(projectId);
      setTasks(data.tasks);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tasks';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMilestones = async (projectId: string) => {
    try {
      const data = await milestoneApi.getMilestones(projectId);
      setMilestones(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load milestones';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      setMilestones([]);
    }
  };

  const handleTasksChange = () => {
    if (selectedProject) {
      loadTasks(selectedProject.id);
    }
  };

  if (projectsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (projects.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your tasks across all projects
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No projects found. Create a project first to start managing tasks.
            </p>
            <a
              href="/projects"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Projects
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tasks across all projects
          </p>
        </div>

        {/* Tasks Section */}
        {selectedProject && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading tasks...
              </div>
            ) : (
              <TaskList
                projectId={selectedProject.id}
                tasks={tasks}
                onTasksChange={handleTasksChange}
                milestones={selectedProject.useMilestones ? milestones : []}
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
