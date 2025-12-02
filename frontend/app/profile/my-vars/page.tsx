'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import UserEnvVarManager from '@/components/envvar/UserEnvVarManager';

export default function MyVarsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Variables</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your personal environment variables
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <UserEnvVarManager />
        </div>
      </div>
    </DashboardLayout>
  );
}
