'use client';

import React from 'react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { ThemeToggle } from '@/components/profile/ThemeToggle';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Profile Information
            </h2>
            <ProfileForm />
          </div>

          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Appearance</h2>
            <ThemeToggle />
          </div>

          {/* Password Change (Email users only) */}
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  );
}
