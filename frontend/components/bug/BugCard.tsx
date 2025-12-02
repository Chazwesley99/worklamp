'use client';

import { Bug } from '@/lib/api/bug';
import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { AIAssistantPanel } from '../ai/AIAssistantPanel';

interface BugCardProps {
  bug: Bug;
  onEdit: (bug: Bug) => void;
  onDelete: (bugId: string) => void;
  onStatusChange: (bugId: string, status: 'open' | 'in-progress' | 'resolved' | 'closed') => void;
  onVote?: (bugId: string) => void;
  showVoting?: boolean;
  isPublicView?: boolean;
}

export function BugCard({
  bug,
  onEdit,
  onDelete,
  onStatusChange,
  onVote,
  showVoting = false,
  isPublicView = false,
}: BugCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(bug.id);
    } catch (error) {
      console.error('Failed to delete bug:', error);
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'text-red-600 dark:text-red-400';
    if (priority >= 50) return 'text-orange-600 dark:text-orange-400';
    if (priority >= 20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {bug.title}
            </h3>
            {bug.priority > 0 && (
              <span className={`text-sm font-medium ${getPriorityColor(bug.priority)}`}>
                P{bug.priority}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {bug.description}
          </p>

          {bug.url && (
            <a
              href={bug.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 block"
            >
              🔗 {bug.url}
            </a>
          )}

          {bug.imageUrl && (
            <div className="mb-3">
              <img
                src={bug.imageUrl}
                alt="Bug screenshot"
                className="max-w-xs rounded border border-gray-300 dark:border-gray-600"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${getStatusColor(bug.status)}`}>
              {bug.status.replace('-', ' ')}
            </span>

            {showVoting && (
              <button
                onClick={() => onVote?.(bug.id)}
                className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                title="Vote for this bug"
              >
                👍 {bug.votes}
              </button>
            )}

            {!showVoting && bug.votes > 0 && (
              <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                👍 {bug.votes}
              </span>
            )}

            {bug.assignments.length > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400">👤</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {bug.assignments.map((a) => a.user.name).join(', ')}
                </span>
              </div>
            ) : (
              <span className="text-gray-500 dark:text-gray-400 italic">not assigned</span>
            )}

            <span className="text-gray-500 dark:text-gray-400">by {bug.createdBy.name}</span>
          </div>
        </div>

        {!isPublicView && (
          <div className="flex items-center gap-1">
            <select
              value={bug.status}
              onChange={(e) =>
                onStatusChange(
                  bug.id,
                  e.target.value as 'open' | 'in-progress' | 'resolved' | 'closed'
                )
              }
              className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              title="Change status"
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <button
              onClick={() => setShowAI(!showAI)}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
              title="AI Assistant"
            >
              🤖
            </button>

            <button
              onClick={() => onEdit(bug)}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              title="Edit bug"
            >
              ✏️
            </button>

            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
              title="Delete bug"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* AI Assistant Panel */}
      {showAI && !isPublicView && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <AIAssistantPanel
            type="bug"
            title={bug.title}
            description={bug.description}
            url={bug.url || undefined}
            imageUrl={bug.imageUrl || undefined}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Bug"
        message={`Are you sure you want to delete "${bug.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
