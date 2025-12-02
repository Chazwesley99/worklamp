'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TaskList } from '@/components/task/TaskList';
import { type Task, taskApi } from '@/lib/api/task';
import { type Project, projectApi } from '@/lib/api/project';
import { milestoneApi, type Milestone } from '@/lib/api/milestone';
import { useToast } from '@/lib/contexts/ToastContext';
import { exportToCSV } from '@/lib/utils/csvExport';

export default function ProjectTasksPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadProjectAndTasks();
  }, [projectId]);

  const loadProjectAndTasks = async () => {
    try {
      setIsLoading(true);
      const projectData = await projectApi.getProject(projectId);
      const tasksData = await taskApi.getTasks(projectId);

      setProject(projectData);
      setTasks(tasksData.tasks);

      // Only load milestones if enabled for this project
      if (projectData.useMilestones) {
        try {
          const milestonesData = await milestoneApi.getMilestones(projectId);
          setMilestones(milestonesData);
        } catch (error) {
          // Ignore milestone loading errors
          setMilestones([]);
        }
      } else {
        setMilestones([]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load project data';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTasksChange = () => {
    loadProjectAndTasks();
  };

  const handleExportCSV = () => {
    const exportData = tasks.map((task) => ({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignees: task.assignments.map((a) => a.user.name).join(', ') || 'Unassigned',
      milestone: task.milestone?.name || 'No Milestone',
      category: task.category || '',
      createdBy: task.createdBy.name,
      createdAt: new Date(task.createdAt).toLocaleDateString(),
      updatedAt: new Date(task.updatedAt).toLocaleDateString(),
    }));

    const headers = [
      { key: 'title' as const, label: 'Title' },
      { key: 'description' as const, label: 'Description' },
      { key: 'status' as const, label: 'Status' },
      { key: 'priority' as const, label: 'Priority' },
      { key: 'assignees' as const, label: 'Assignees' },
      { key: 'milestone' as const, label: 'Milestone' },
      { key: 'category' as const, label: 'Category' },
      { key: 'createdBy' as const, label: 'Created By' },
      { key: 'createdAt' as const, label: 'Created' },
      { key: 'updatedAt' as const, label: 'Updated' },
    ];

    const filename = `${project?.name || 'project'}-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(exportData, headers, filename);
    showToast('Tasks exported successfully', 'success');
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
            {project.description || 'Manage tasks for this project'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <TaskList
            projectId={projectId}
            tasks={tasks}
            onTasksChange={handleTasksChange}
            milestones={project?.useMilestones ? milestones : []}
            onExport={handleExportCSV}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
