'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useProject } from '@/lib/contexts/ProjectContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import FeatureRequestList from '@/components/feature/FeatureRequestList';

export default function FeaturesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { selectedProject } = useProject();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
      } else {
        setIsLoading(false);
      }
    }
  }, [user, authLoading, router]);

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Project Selected
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please select a project to view requests.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FeatureRequestList projectId={selectedProject.id} />
    </DashboardLayout>
  );
}
