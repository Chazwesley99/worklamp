import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  authProvider: 'email' | 'google';
  emailVerified: boolean;
  emailOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export function useUser() {
  return useQuery<User>({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.get<User>('/api/users/me'),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => apiClient.patch<User>('/api/users/me', data),
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'me'], data);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) =>
      apiClient.patch<{ message: string }>('/api/users/me/password', data),
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => apiClient.uploadFile<User>('/api/users/me/avatar', file, 'avatar'),
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'me'], data);
    },
  });
}
