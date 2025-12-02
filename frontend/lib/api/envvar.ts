import { apiClient } from '../api';

export interface EnvVar {
  id: string;
  projectId: string;
  key: string;
  value: string;
  environment: 'development' | 'production';
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnvVarInput {
  key: string;
  value: string;
  environment: 'development' | 'production';
}

export interface UpdateEnvVarInput {
  key?: string;
  value?: string;
  environment?: 'development' | 'production';
}

/**
 * Get all environment variables for a project
 */
export async function getEnvVars(projectId: string): Promise<EnvVar[]> {
  return apiClient.get<EnvVar[]>(`/api/projects/${projectId}/env-vars`);
}

/**
 * Create a new environment variable
 */
export async function createEnvVar(projectId: string, data: CreateEnvVarInput): Promise<EnvVar> {
  return apiClient.post<EnvVar>(`/api/projects/${projectId}/env-vars`, data);
}

/**
 * Update an environment variable
 */
export async function updateEnvVar(id: string, data: UpdateEnvVarInput): Promise<EnvVar> {
  return apiClient.patch<EnvVar>(`/api/env-vars/${id}`, data);
}

/**
 * Delete an environment variable
 */
export async function deleteEnvVar(id: string): Promise<void> {
  await apiClient.delete<void>(`/api/env-vars/${id}`);
}
