'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatPanel } from '@/components/channel/ChatPanel';
import { useProject } from '@/lib/contexts/ProjectContext';

export default function ChannelsPage() {
  const { selectedProject } = useProject();

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)]">
        {selectedProject ? (
          <ChatPanel projectId={selectedProject.id} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">Please select a project to view channels</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
