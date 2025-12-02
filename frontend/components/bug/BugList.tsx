'use client';

import { useState, useMemo } from 'react';
import { Bug, bugApi, CreateBugRequest, UpdateBugRequest } from '@/lib/api/bug';
import { BugCard } from './BugCard';
import { BugForm } from './BugForm';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '@/lib/contexts/ToastContext';

interface BugListProps {
  projectId: string;
  bugs: Bug[];
  onBugsChange: () => void;
  teamMembers?: Array<{ id: string; name: string; email: string }>;
  showVoting?: boolean;
  isPublicView?: boolean;
}

export function BugList({
  projectId,
  bugs,
  onBugsChange,
  teamMembers = [],
  showVoting = false,
  isPublicView = false,
}: BugListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBug, setEditingBug] = useState<Bug | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'votes' | 'created'>('priority');
  const { showToast } = useToast();

  // Filter and sort bugs
  const filteredBugs = useMemo(() => {
    let filtered = bugs;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bug) =>
          bug.title.toLowerCase().includes(query) ||
          bug.description.toLowerCase().includes(query) ||
          bug.url?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((bug) => bug.status === statusFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priority - a.priority;
        case 'votes':
          return b.votes - a.votes;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [bugs, searchQuery, statusFilter, sortBy]);

  const handleCreateBug = async (data: CreateBugRequest | UpdateBugRequest, imageFile?: File) => {
    try {
      await bugApi.createBug(projectId, data as CreateBugRequest, imageFile);
      showToast('Bug reported successfully', 'success');
      onBugsChange();
      setIsFormOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to report bug';
      throw new Error(message);
    }
  };

  const handleUpdateBug = async (data: CreateBugRequest | UpdateBugRequest, imageFile?: File) => {
    if (!editingBug) return;
    try {
      await bugApi.updateBug(editingBug.id, data as UpdateBugRequest);

      // Upload image separately if provided
      if (imageFile) {
        await bugApi.uploadImage(editingBug.id, imageFile);
      }

      showToast('Bug updated successfully', 'success');
      onBugsChange();
      setEditingBug(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update bug';
      throw new Error(message);
    }
  };

  const handleDeleteBug = async (bugId: string) => {
    try {
      await bugApi.deleteBug(bugId);
      showToast('Bug deleted successfully', 'success');
      onBugsChange();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete bug';
      showToast(message, 'error');
    }
  };

  const handleStatusChange = async (
    bugId: string,
    status: 'open' | 'in-progress' | 'resolved' | 'closed'
  ) => {
    try {
      await bugApi.updateBug(bugId, { status });
      showToast('Bug status updated', 'success');
      onBugsChange();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update bug status';
      showToast(message, 'error');
    }
  };

  const handleVote = async (bugId: string) => {
    try {
      await bugApi.voteBug(bugId);
      showToast('Vote recorded', 'success');
      onBugsChange();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to vote';
      showToast(message, 'error');
    }
  };

  const handleEditBug = (bug: Bug) => {
    setEditingBug(bug);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isPublicView ? 'Bug Reports' : 'Bugs'}
        </h2>
        {!isPublicView && <Button onClick={() => setIsFormOpen(true)}>+ Report Bug</Button>}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          placeholder="Search bugs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'open', label: 'Open' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ]}
        />

        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'priority' | 'votes' | 'created')}
          options={[
            { value: 'priority', label: 'Sort by Priority' },
            { value: 'votes', label: 'Sort by Votes' },
            { value: 'created', label: 'Sort by Created' },
          ]}
        />
      </div>

      {/* Bug List */}
      {filteredBugs.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {bugs.length === 0 ? (
            <>
              <p className="text-lg mb-2">No bugs reported yet</p>
              {!isPublicView && <p className="text-sm">Report your first bug to get started</p>}
            </>
          ) : (
            <p>No bugs match your filters</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBugs.map((bug) => (
            <BugCard
              key={bug.id}
              bug={bug}
              onEdit={handleEditBug}
              onDelete={handleDeleteBug}
              onStatusChange={handleStatusChange}
              onVote={handleVote}
              showVoting={showVoting}
              isPublicView={isPublicView}
            />
          ))}
        </div>
      )}

      {/* Bug Form Modal */}
      {!isPublicView && (
        <BugForm
          isOpen={isFormOpen || !!editingBug}
          onClose={() => {
            setIsFormOpen(false);
            setEditingBug(null);
          }}
          onSubmit={editingBug ? handleUpdateBug : handleCreateBug}
          bug={editingBug}
          projectId={projectId}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
}
