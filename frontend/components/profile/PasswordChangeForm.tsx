'use client';

import React, { useState } from 'react';
import { useUser, useChangePassword } from '@/lib/hooks/useUser';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock } from 'lucide-react';

export function PasswordChangeForm() {
  const { data: user } = useUser();
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Only show for email users
  if (!user || user.authProvider !== 'email') {
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});

      alert('Password changed successfully!');
    } catch (error) {
      const apiError = error as { error?: { code?: string; message?: string } };
      if (apiError?.error?.code === 'INVALID_PASSWORD') {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        alert(apiError?.error?.message || 'Failed to change password');
      }
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Lock className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Change Password</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={errors.currentPassword}
          placeholder="Enter current password"
        />

        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errors.newPassword}
          placeholder="Enter new password"
        />

        <Input
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          placeholder="Confirm new password"
        />

        <div className="text-sm text-gray-500">
          <p>Password requirements:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>At least 8 characters long</li>
            <li>Contains uppercase and lowercase letters</li>
            <li>Contains at least one number</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={changePassword.isPending}>
            Change Password
          </Button>
        </div>
      </form>
    </div>
  );
}
