import { apiClient } from '../api';

export interface UserEnvVar {
  id: string;
  userId: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserEnvVarInput {
  key: string;
  value: string;
}

export interface UpdateUserEnvVarInput {
  key?: string;
  value?: string;
}

/**
 * Get all environment variables for the current user
 */
export async function getUserEnvVars(): Promise<UserEnvVar[]> {
  return apiClient.get<UserEnvVar[]>('/api/users/me/env-vars');
}

/**
 * Create a new user environment variable
 */
export async function createUserEnvVar(data: CreateUserEnvVarInput): Promise<UserEnvVar> {
  return apiClient.post<UserEnvVar>('/api/users/me/env-vars', data);
}

/**
 * Update a user environment variable
 */
export async function updateUserEnvVar(
  id: string,
  data: UpdateUserEnvVarInput
): Promise<UserEnvVar> {
  return apiClient.patch<UserEnvVar>(`/api/users/me/env-vars/${id}`, data);
}

/**
 * Delete a user environment variable
 */
export async function deleteUserEnvVar(id: string): Promise<void> {
  await apiClient.delete<void>(`/api/users/me/env-vars/${id}`);
}
