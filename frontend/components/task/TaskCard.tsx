'use client';

import { Task } from '@/lib/api/task';
import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: 'todo' | 'in-progress' | 'done') => void;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
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
              {task.title}
            </h3>
            {task.priority > 0 && (
              <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                P{task.priority}
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ')}
            </span>

            {task.category && (
              <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                {task.category}
              </span>
            )}

            {task.milestone && (
              <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                📍 {task.milestone.name}
              </span>
            )}

            {task.assignments.length > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400">👤</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {task.assignments.map((a) => a.user.name).join(', ')}
                </span>
              </div>
            ) : (
              <span className="text-gray-500 dark:text-gray-400 italic">not assigned</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <select
            value={task.status}
            onChange={(e) =>
              onStatusChange(task.id, e.target.value as 'todo' | 'in-progress' | 'done')
            }
            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            title="Change status"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            title="Edit task"
          >
            ✏️
          </button>

          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
