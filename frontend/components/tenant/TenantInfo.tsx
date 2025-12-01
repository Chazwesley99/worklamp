'use client';

import { Tenant } from '@/lib/api/tenant';

interface TenantInfoProps {
  tenant: Tenant;
}

export function TenantInfo({ tenant }: TenantInfoProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Workspace Information
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Workspace Name
          </label>
          <p className="text-lg text-gray-900 dark:text-white">{tenant.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subscription Tier
          </label>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              tenant.subscriptionTier === 'paid'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            {tenant.subscriptionTier === 'paid' ? 'Paid' : 'Free'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Projects
            </label>
            <p className="text-lg text-gray-900 dark:text-white">
              {tenant.projectCount} / {tenant.maxProjects}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team Members
            </label>
            <p className="text-lg text-gray-900 dark:text-white">
              {tenant.memberCount} / {tenant.maxTeamMembers}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Owner
          </label>
          <div className="flex items-center gap-2">
            {tenant.owner.avatarUrl ? (
              <img
                src={tenant.owner.avatarUrl}
                alt={tenant.owner.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {tenant.owner.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {tenant.owner.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{tenant.owner.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
