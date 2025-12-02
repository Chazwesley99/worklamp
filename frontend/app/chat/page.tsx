'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatPanel } from '@/components/channel/ChatPanel';
import { useProject } from '@/lib/contexts/ProjectContext';

export default function ChatPage() {
  const { selectedProject } = useProject();

  return (
    <DashboardLayout>
      <div className="h-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Team Chat</h1>

        {selectedProject ? (
          <div
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{ height: 'calc(100vh - 200px)' }}
          >
            <ChatPanel projectId={selectedProject.id} />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Project Selected
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please select a project to start chatting with your team
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Use the project selector in the header to choose a project
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
