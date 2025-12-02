'use client';

import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AIConfigForm } from '@/components/ai/AIConfigForm';

export default function AISettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Link
            href="/profile"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure AI assistance for your workspace
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <AIConfigForm />
        </div>
      </div>
    </DashboardLayout>
  );
}
