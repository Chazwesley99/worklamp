'use client';

import { useState } from 'react';
import { TenantMember } from '@/lib/api/tenant';
import { Button } from '../ui/Button';

interface TeamMemberListProps {
  members: TenantMember[];
  currentUserId: string;
  isOwnerOrAdmin: boolean;
  onRemoveMember: (userId: string) => void;
  onUpdateRole: (userId: string, role: 'admin' | 'developer' | 'auditor') => void;
}

export function TeamMemberList({
  members,
  currentUserId,
  isOwnerOrAdmin,
  onRemoveMember,
  onUpdateRole,
}: TeamMemberListProps) {
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'developer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'auditor':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    if (newRole === 'admin' || newRole === 'developer' || newRole === 'auditor') {
      onUpdateRole(memberId, newRole);
      setEditingMemberId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Team Members</h2>

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                {member.user.avatarUrl ? (
                  <img
                    src={member.user.avatarUrl}
                    alt={member.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{member.user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{member.user.email}</p>
                </div>

                {editingMemberId === member.id && member.role !== 'owner' ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.user.id, e.target.value)}
                    className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="developer">Developer</option>
                    <option value="auditor">Auditor</option>
                  </select>
                ) : (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(
                      member.role
                    )}`}
                  >
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                )}
              </div>

              {isOwnerOrAdmin && member.role !== 'owner' && member.user.id !== currentUserId && (
                <div className="flex items-center gap-2 ml-4">
                  {editingMemberId === member.id ? (
                    <Button variant="secondary" size="sm" onClick={() => setEditingMemberId(null)}>
                      Cancel
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingMemberId(member.id)}
                      >
                        Change Role
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to remove ${member.user.name} from the team?`
                            )
                          ) {
                            onRemoveMember(member.user.id);
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
