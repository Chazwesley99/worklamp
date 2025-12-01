'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';
import { useUpdateProfile, useUploadAvatar } from '@/lib/hooks/useUser';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Upload } from 'lucide-react';

export function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with user data
  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-upload the avatar
      try {
        await uploadAvatar.mutateAsync(file);
        await refreshUser(); // Refresh user data to update avatar everywhere
        showSuccess('Profile picture updated successfully!');
      } catch (error) {
        const apiError = error as { error?: { message?: string } };
        showError(apiError?.error?.message || 'Failed to upload avatar');
        // Revert preview on error
        setAvatarPreview(user?.avatarUrl || null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Update profile if name changed
      if (name !== user?.name) {
        await updateProfile.mutateAsync({ name });
        await refreshUser();
        showSuccess('Profile updated successfully!');
      } else {
        showError('No changes to save');
      }
    } catch (error) {
      const apiError = error as { error?: { message?: string } };
      showError(apiError?.error?.message || 'Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <p className="text-sm text-gray-500">Click the upload button to change your avatar</p>
      </div>

      {/* Name Input */}
      <Input
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        required
      />

      {/* Email (Read-only) */}
      <Input label="Email" type="email" value={user.email} disabled className="bg-gray-100" />

      {/* Auth Provider Info */}
      <div className="text-sm text-gray-500">
        <p>
          Authentication method:{' '}
          <span className="font-medium">
            {user.authProvider === 'email' ? 'Email/Password' : 'Google OAuth'}
          </span>
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setName(user.name);
            setAvatarPreview(user.avatarUrl || null);
          }}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={updateProfile.isPending || uploadAvatar.isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
