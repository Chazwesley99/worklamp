'use client';

import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import EnvVarManager from '@/components/envvar/EnvVarManager';

export default function ProjectEnvVarsPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Environment Variables
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage project environment variables for development and production
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <EnvVarManager projectId={projectId} />
        </div>
      </div>
    </DashboardLayout>
  );
}
