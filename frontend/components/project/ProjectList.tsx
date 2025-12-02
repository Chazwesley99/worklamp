'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectApi, type Project } from '@/lib/api/project';
import { Button } from '@/components/ui/Button';

interface ProjectListProps {
  onSelectProject?: (project: Project) => void;
  onCreateProject?: () => void;
  onEditProject?: (project: Project) => void;
  selectedProjectId?: string;
}

export function ProjectList({
  onSelectProject,
  onCreateProject,
  onEditProject,
  selectedProjectId,
}: ProjectListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getProjects(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
        Failed to load projects. Please try again.
      </div>
    );
  }

  const projects = data?.projects || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
        {onCreateProject && (
          <Button onClick={onCreateProject} size="sm">
            + New Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No projects yet</p>
          {onCreateProject && (
            <Button onClick={onCreateProject} variant="outline">
              Create your first project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedProjectId === project.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => onSelectProject?.(project)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 flex-wrap">
                {project.useMilestones && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded">
                    Milestones
                  </span>
                )}
                {project.publicBugTracking && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    Public Bugs
                  </span>
                )}
                {project.publicFeatureRequests && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    Public Features
                  </span>
                )}
              </div>

              {onEditProject && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProject(project);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
