'use client';

import { useState } from 'react';
import { FeatureRequest } from '@/lib/api/feature';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useToast } from '@/lib/contexts/ToastContext';
import { Button } from '../ui/Button';
import { AIAssistantPanel } from '../ai/AIAssistantPanel';

interface FeatureRequestCardProps {
  feature: FeatureRequest;
  onEdit?: (feature: FeatureRequest) => void;
  onDelete?: (featureId: string) => void;
  onVote?: (featureId: string) => void;
  isPublicView?: boolean;
  projectId?: string;
}

export default function FeatureRequestCard({
  feature,
  onEdit,
  onDelete,
  onVote,
  isPublicView = false,
  projectId,
}: FeatureRequestCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleVote = async () => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      if (onVote) {
        await onVote(feature.id);
        showToast('Vote recorded successfully', 'success');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      showToast(err.response?.data?.error?.message || 'Failed to vote', 'error');
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!confirm('Are you sure you want to delete this feature request?')) return;

    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(feature.id);
        showToast('Feature request deleted successfully', 'success');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      showToast(err.response?.data?.error?.message || 'Failed to delete request', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'planned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const hasVoted = Boolean(user && feature.featureVotes.some((vote) => vote.userId === user.id));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center gap-1 min-w-[60px]">
          <button
            onClick={handleVote}
            disabled={isVoting || hasVoted}
            className={`p-2 rounded-lg transition-colors ${
              hasVoted
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title={hasVoted ? 'Already voted' : 'Vote for this request'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {feature.votes}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">votes</span>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(
                feature.status
              )}`}
            >
              {feature.status}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
            {feature.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <span>Priority:</span>
              <span className="font-medium">{feature.priority}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>By:</span>
              <span className="font-medium">{feature.createdBy.name}</span>
            </div>
            {feature.assignments.length > 0 && (
              <div className="flex items-center gap-1">
                <span>Assigned to:</span>
                <span className="font-medium">
                  {feature.assignments.map((a) => a.user.name).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          {!isPublicView && user && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowAI(!showAI)}>
                🤖 {showAI ? 'Hide' : 'Show'} AI
              </Button>
              {onEdit && (
                <Button variant="secondary" size="sm" onClick={() => onEdit(feature)}>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="danger" size="sm" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Panel */}
      {showAI && !isPublicView && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <AIAssistantPanel
            type="feature"
            title={feature.title}
            description={feature.description}
            projectId={projectId}
            includeSpecFiles={true}
          />
        </div>
      )}
    </div>
  );
}
