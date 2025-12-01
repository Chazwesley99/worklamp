'use client';

import { useEffect, useState } from 'react';
import { tenantApi, Tenant, TenantMember } from '@/lib/api/tenant';
import { TenantInfo } from '@/components/tenant/TenantInfo';
import { TeamMemberList } from '@/components/tenant/TeamMemberList';
import { InviteUserForm } from '@/components/tenant/InviteUserForm';

export default function TeamPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantData, membersData] = await Promise.all([
        tenantApi.getCurrentTenant(),
        tenantApi.getTenantMembers(),
      ]);

      setTenant(tenantData);
      setMembers(membersData.members);

      // Get current user ID from tenant owner or first member
      // In a real app, this would come from auth context
      setCurrentUserId(tenantData.owner.id);
    } catch (err: unknown) {
      const apiError = err as { error?: { message?: string } };
      setError(apiError.error?.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (email: string, role: 'admin' | 'developer' | 'auditor') => {
    await tenantApi.inviteUser({ email, role });
    // Reload members list
    const membersData = await tenantApi.getTenantMembers();
    setMembers(membersData.members);
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await tenantApi.removeMember(userId);
      // Reload members list
      const membersData = await tenantApi.getTenantMembers();
      setMembers(membersData.members);
    } catch (err: unknown) {
      const apiError = err as { error?: { message?: string } };
      alert(apiError.error?.message || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (userId: string, role: 'admin' | 'developer' | 'auditor') => {
    try {
      await tenantApi.updateMemberRole(userId, { role });
      // Reload members list
      const membersData = await tenantApi.getTenantMembers();
      setMembers(membersData.members);
    } catch (err: unknown) {
      const apiError = err as { error?: { message?: string } };
      alert(apiError.error?.message || 'Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return null;
  }

  const isOwnerOrAdmin =
    members.find((m) => m.user.id === currentUserId)?.role === 'owner' ||
    members.find((m) => m.user.id === currentUserId)?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Team Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TenantInfo tenant={tenant} />
            <TeamMemberList
              members={members}
              currentUserId={currentUserId}
              isOwnerOrAdmin={isOwnerOrAdmin}
              onRemoveMember={handleRemoveMember}
              onUpdateRole={handleUpdateRole}
            />
          </div>

          <div>{isOwnerOrAdmin && <InviteUserForm onInvite={handleInviteUser} />}</div>
        </div>
      </div>
    </div>
  );
}
