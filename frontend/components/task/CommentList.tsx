'use client';

import { useState, useEffect } from 'react';
import { Comment, taskApi } from '@/lib/api/task';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '@/lib/contexts/ToastContext';

interface CommentListProps {
  resourceType: 'task' | 'bug' | 'feature' | 'milestone';
  resourceId: string;
}

export function CommentList({ resourceType, resourceId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadComments();
  }, [resourceType, resourceId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await taskApi.getComments(resourceType, resourceId);
      setComments(data.comments);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load comments';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      await taskApi.createComment({
        content: newComment,
        resourceType,
        resourceId,
      });
      setNewComment('');
      showToast('Comment added', 'success');
      loadComments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add comment';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (commentId: string) => {
    setDeleteCommentId(commentId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCommentId) return;

    try {
      await taskApi.deleteComment(deleteCommentId);
      showToast('Comment deleted', 'success');
      loadComments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete comment';
      showToast(message, 'error');
    } finally {
      setDeleteCommentId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading comments...</div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* Comment List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {comment.user.avatarUrl ? (
                  <img
                    src={comment.user.avatarUrl}
                    alt={comment.user.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                    {comment.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {comment.user.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <button
                onClick={() => handleDeleteClick(comment.id)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                title="Delete comment"
              >
                🗑️
              </button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? 'Adding...' : 'Add Comment'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={!!deleteCommentId}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
