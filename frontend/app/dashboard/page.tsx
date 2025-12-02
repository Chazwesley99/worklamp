'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectList } from '@/components/project/ProjectList';
import { ProjectForm } from '@/components/project/ProjectForm';
import { TaskList } from '@/components/task/TaskList';
import { BugList } from '@/components/bug/BugList';
import FeatureRequestList from '@/components/feature/FeatureRequestList';
import { type Task, taskApi } from '@/lib/api/task';
import { type Bug, bugApi } from '@/lib/api/bug';
import { type FeatureRequest, featureApi } from '@/lib/api/feature';
import { useProject } from '@/lib/contexts/ProjectContext';
import { useToast } from '@/lib/contexts/ToastContext';

export default function DashboardPage() {
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const { selectedProject, refreshProjects } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingBugs, setIsLoadingBugs] = useState(false);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'bugs' | 'features'>('tasks');
  const { showToast } = useToast();

  // Load tasks, bugs, and features when a project is selected
  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject.id);
      loadBugs(selectedProject.id);
      loadFeatures(selectedProject.id);
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

  const loadBugs = async (projectId: string) => {
    try {
      setIsLoadingBugs(true);
      const data = await bugApi.getBugs(projectId);
      setBugs(data);
    } catch (error) {
      // Only show error toast if it's not a 404 (no bugs is expected for new projects)
      const message = error instanceof Error ? error.message : 'Failed to load bugs';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      setBugs([]);
    } finally {
      setIsLoadingBugs(false);
    }
  };

  const loadFeatures = async (projectId: string) => {
    try {
      setIsLoadingFeatures(true);
      const data = await featureApi.getFeatures(projectId);
      setFeatures(data);
    } catch (error) {
      // Only show error toast if it's not a 404 (no features is expected for new projects)
      const message = error instanceof Error ? error.message : 'Failed to load feature requests';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      setFeatures([]);
    } finally {
      setIsLoadingFeatures(false);
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

  const handleBugsChange = () => {
    if (selectedProject) {
      loadBugs(selectedProject.id);
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

        {/* Project Content */}
        {selectedProject ? (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'tasks'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('bugs')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'bugs'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Bugs ({bugs.length})
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'features'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Requests ({features.length})
              </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {activeTab === 'tasks' ? (
                isLoadingTasks ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading tasks...
                  </div>
                ) : (
                  <TaskList
                    projectId={selectedProject.id}
                    tasks={tasks}
                    onTasksChange={handleTasksChange}
                  />
                )
              ) : activeTab === 'bugs' ? (
                isLoadingBugs ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading bugs...
                  </div>
                ) : (
                  <BugList
                    projectId={selectedProject.id}
                    bugs={bugs}
                    onBugsChange={handleBugsChange}
                  />
                )
              ) : isLoadingFeatures ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading feature requests...
                </div>
              ) : (
                <FeatureRequestList projectId={selectedProject.id} />
              )}
            </div>
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
