'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Project, projectApi } from '@/lib/api/project';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  isLoading: boolean;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectApi.getProjects();
      setProjects(data.projects);

      // Auto-select first project if none selected
      if (data.projects.length > 0 && !selectedProject) {
        setSelectedProject(data.projects[0]);
      }

      // If selected project exists, update it with fresh data
      if (selectedProject) {
        const updatedSelectedProject = data.projects.find((p) => p.id === selectedProject.id);
        if (updatedSelectedProject) {
          setSelectedProject(updatedSelectedProject);
        } else {
          // If selected project no longer exists, select first available
          setSelectedProject(data.projects[0] || null);
        }
      }
    } catch (error) {
      // Only show error toast if it's not a 404 (no projects found is expected for new users)
      const message = error instanceof Error ? error.message : 'Failed to load projects';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      // Set empty projects array on error
      setProjects([]);
      setSelectedProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load projects when auth is ready and user is authenticated
    if (!authLoading && isAuthenticated) {
      loadProjects();
    } else if (!authLoading && !isAuthenticated) {
      // User is not authenticated, clear projects and stop loading
      setProjects([]);
      setSelectedProject(null);
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const refreshProjects = async () => {
    await loadProjects();
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        setSelectedProject,
        isLoading,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
