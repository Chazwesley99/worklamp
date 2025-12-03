'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { projectFilesApi, ProjectFile } from '@/lib/api/projectfiles';
import { useToast } from '@/lib/contexts/ToastContext';
import { ApiError } from '@/lib/api';

export default function ProjectFilesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [uploadingType, setUploadingType] = useState<string | null>(null);

  // Fetch files
  const { data, isLoading } = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: () => projectFilesApi.getFiles(projectId),
    enabled: !!projectId,
  });

  const files = data?.files || [];

  // Group files by type
  const requirementsFile = files.find((f) => f.fileType === 'requirements');
  const designFile = files.find((f) => f.fileType === 'design');
  const tasksFile = files.find((f) => f.fileType === 'tasks');
  const generalFiles = files.filter((f) => f.fileType === 'general');

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      fileType,
    }: {
      file: File;
      fileType: 'requirements' | 'design' | 'tasks' | 'general';
    }) => projectFilesApi.uploadFile(projectId, file, fileType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
      showToast('File uploaded successfully', 'success');
      setUploadingType(null);
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      showToast(apiError.error?.message || 'Failed to upload file', 'error');
      setUploadingType(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => projectFilesApi.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
      showToast('File deleted successfully', 'success');
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      showToast(apiError.error?.message || 'Failed to delete file', 'error');
    },
  });

  // Generate milestones mutation
  const generateMilestonesMutation = useMutation({
    mutationFn: (fileId: string) => projectFilesApi.generateMilestones(fileId),
    onSuccess: (data) => {
      showToast(
        `Generated ${data.milestonesCreated} milestones and ${data.tasksCreated} tasks!`,
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (error: unknown) => {
      const apiError = error as ApiError;
      showToast(apiError.error?.message || 'Failed to generate milestones', 'error');
    },
  });

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: 'requirements' | 'design' | 'tasks' | 'general'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingType(fileType);
    uploadMutation.mutate({ file, fileType });
  };

  const handleDelete = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(fileId);
    }
  };

  const handleGenerateMilestones = () => {
    if (!tasksFile) return;

    if (confirm('This will create milestones and tasks from the Tasks.md file. Continue?')) {
      generateMilestonesMutation.mutate(tasksFile.id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Project Files</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Upload and manage project documentation files
          </p>
        </div>

        {/* Recommended Files Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recommended AI Assistant Files
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload these files to help AI assistants better understand your project
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Requirements File */}
            <FileUploadCard
              title="Requirements"
              description="Project requirements document"
              file={requirementsFile}
              fileType="requirements"
              onUpload={handleFileUpload}
              onDelete={handleDelete}
              isUploading={uploadingType === 'requirements'}
              formatFileSize={formatFileSize}
              formatDate={formatDate}
            />

            {/* Design File */}
            <FileUploadCard
              title="Design"
              description="Design specifications document"
              file={designFile}
              fileType="design"
              onUpload={handleFileUpload}
              onDelete={handleDelete}
              isUploading={uploadingType === 'design'}
              formatFileSize={formatFileSize}
              formatDate={formatDate}
            />

            {/* Tasks File */}
            <FileUploadCard
              title="Tasks"
              description="Tasks list (Tasks.md format)"
              file={tasksFile}
              fileType="tasks"
              onUpload={handleFileUpload}
              onDelete={handleDelete}
              isUploading={uploadingType === 'tasks'}
              formatFileSize={formatFileSize}
              formatDate={formatDate}
              extraActions={
                tasksFile && (
                  <button
                    onClick={handleGenerateMilestones}
                    disabled={generateMilestonesMutation.isPending}
                    className="mt-2 w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generateMilestonesMutation.isPending
                      ? 'Generating...'
                      : 'Generate Milestones & Tasks'}
                  </button>
                )
              }
            />
          </div>
        </div>

        {/* General Files Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            General Files
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* Upload Button */}
            <div className="mb-4">
              <label className="inline-block">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'general')}
                  disabled={uploadingType === 'general'}
                />
                <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer inline-block">
                  {uploadingType === 'general' ? 'Uploading...' : 'Upload File'}
                </span>
              </label>
            </div>

            {/* Files List */}
            {generalFiles.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No general files uploaded yet
              </p>
            ) : (
              <div className="space-y-2">
                {generalFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {file.fileName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.fileSize)} • Uploaded {formatDate(file.createdAt)} by{' '}
                        {file.uploadedBy.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface FileUploadCardProps {
  title: string;
  description: string;
  file: ProjectFile | undefined;
  fileType: 'requirements' | 'design' | 'tasks' | 'general';
  onUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: 'requirements' | 'design' | 'tasks' | 'general'
  ) => void;
  onDelete: (fileId: string) => void;
  isUploading: boolean;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
  extraActions?: React.ReactNode;
}

function FileUploadCard({
  title,
  description,
  file,
  fileType,
  onUpload,
  onDelete,
  isUploading,
  formatFileSize,
  formatDate,
  extraActions,
}: FileUploadCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>

      {file ? (
        <div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-2">
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
              {file.fileName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatFileSize(file.fileSize)} • {formatDate(file.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm text-center rounded-md hover:bg-blue-700"
            >
              Download
            </a>
            <button
              onClick={() => onDelete(file.id)}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
          {extraActions}
        </div>
      ) : (
        <label className="block">
          <input
            type="file"
            className="hidden"
            onChange={(e) => onUpload(e, fileType)}
            disabled={isUploading}
          />
          <span className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 cursor-pointer">
            {isUploading ? 'Uploading...' : 'Upload File'}
          </span>
        </label>
      )}
    </div>
  );
}
