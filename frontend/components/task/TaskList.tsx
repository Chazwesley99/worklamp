'use client';

import { useState, useMemo } from 'react';
import { Task, taskApi, CreateTaskRequest, UpdateTaskRequest } from '@/lib/api/task';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '@/lib/contexts/ToastContext';

interface TaskListProps {
  projectId: string;
  tasks: Task[];
  onTasksChange: () => void;
  milestones?: Array<{ id: string; name: string }>;
  teamMembers?: Array<{ id: string; name: string; email: string }>;
  onExport?: () => void;
}

export function TaskList({
  projectId,
  tasks,
  onTasksChange,
  milestones = [],
  teamMembers = [],
  onExport,
}: TaskListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [milestoneFilter, setMilestoneFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'created' | 'status'>('priority');
  const { showToast } = useToast();

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    tasks.forEach((task) => {
      if (task.category) cats.add(task.category);
    });
    return Array.from(cats).sort();
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.category?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((task) => task.category === categoryFilter);
    }

    // Milestone filter
    if (milestoneFilter !== 'all') {
      if (milestoneFilter === 'none') {
        filtered = filtered.filter((task) => !task.milestoneId);
      } else {
        filtered = filtered.filter((task) => task.milestoneId === milestoneFilter);
      }
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priority - a.priority;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'status': {
          const statusOrder = { todo: 0, 'in-progress': 1, done: 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchQuery, statusFilter, categoryFilter, milestoneFilter, sortBy]);

  // Group tasks by category
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    filteredTasks.forEach((task) => {
      const category = task.category || 'Uncategorized';
      if (!groups[category]) groups[category] = [];
      groups[category].push(task);
    });
    return groups;
  }, [filteredTasks]);

  const handleCreateTask = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    try {
      await taskApi.createTask(projectId, data as CreateTaskRequest);
      showToast('Task created successfully', 'success');
      onTasksChange();
      setIsFormOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      throw new Error(message);
    }
  };

  const handleUpdateTask = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    if (!editingTask) return;
    try {
      await taskApi.updateTask(editingTask.id, data as UpdateTaskRequest);
      showToast('Task updated successfully', 'success');
      onTasksChange();
      setEditingTask(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update task';
      throw new Error(message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      showToast('Task deleted successfully', 'success');
      onTasksChange();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete task';
      showToast(message, 'error');
    }
  };

  const handleStatusChange = async (taskId: string, status: 'todo' | 'in-progress' | 'done') => {
    try {
      await taskApi.updateTask(taskId, { status });
      showToast('Task status updated', 'success');
      onTasksChange();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update task status';
      showToast(message, 'error');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsFormOpen(true)}
          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          title="New Task"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
        </button>
        {onExport && (
          <button
            onClick={onExport}
            disabled={tasks.length === 0}
            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export CSV"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'todo', label: 'To Do' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'done', label: 'Done' },
          ]}
        />

        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Categories' },
            ...categories.map((cat) => ({ value: cat, label: cat })),
          ]}
        />

        {milestones.length > 0 && (
          <Select
            value={milestoneFilter}
            onChange={(e) => setMilestoneFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Milestones' },
              { value: 'none', label: 'No Milestone' },
              ...milestones.map((milestone) => ({ value: milestone.id, label: milestone.name })),
            ]}
          />
        )}

        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'priority' | 'created' | 'status')}
          options={[
            { value: 'priority', label: 'Sort by Priority' },
            { value: 'created', label: 'Sort by Created' },
            { value: 'status', label: 'Sort by Status' },
          ]}
        />
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {tasks.length === 0 ? (
            <>
              <p className="text-lg mb-2">No tasks yet</p>
              <p className="text-sm">Create your first task to get started</p>
            </>
          ) : (
            <p>No tasks match your filters</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {category} ({categoryTasks.length})
              </h3>
              <div className="space-y-2">
                {categoryTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen || !!editingTask}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        projectId={projectId}
        milestones={milestones}
        teamMembers={teamMembers}
        existingCategories={categories}
      />
    </div>
  );
}
