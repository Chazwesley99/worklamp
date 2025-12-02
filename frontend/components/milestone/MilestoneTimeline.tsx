'use client';

import { Milestone } from '@/lib/api/milestone';
import { format } from 'date-fns';
import { Button } from '../ui/Button';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestoneId: string) => void;
  onLock: (milestoneId: string, isLocked: boolean) => void;
  onViewChangeOrders: (milestoneId: string) => void;
}

export default function MilestoneTimeline({
  milestones,
  onEdit,
  onDelete,
  onLock,
  onViewChangeOrders,
}: MilestoneTimelineProps) {
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return (
      new Date(a.estimatedCompletionDate).getTime() - new Date(b.estimatedCompletionDate).getTime()
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'planned':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'planned':
        return 'Planned';
      default:
        return status;
    }
  };

  if (sortedMilestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No milestones yet. Create your first milestone to get started.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />

      {/* Milestones */}
      <div className="space-y-6">
        {sortedMilestones.map((milestone) => (
          <div key={milestone.id} className="relative pl-12">
            {/* Timeline dot */}
            <div
              className={`absolute left-2 top-2 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(
                milestone.status
              )}`}
            />

            {/* Milestone card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {milestone.name}
                    </h3>
                    {milestone.isLocked && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        🔒 Locked
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        milestone.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : milestone.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {getStatusText(milestone.status)}
                    </span>
                  </div>

                  {milestone.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {milestone.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Target:</span>{' '}
                      {format(new Date(milestone.estimatedCompletionDate), 'MMM d, yyyy')}
                    </div>
                    {milestone.actualCompletionDate && (
                      <div>
                        <span className="font-medium">Completed:</span>{' '}
                        {format(new Date(milestone.actualCompletionDate), 'MMM d, yyyy')}
                      </div>
                    )}
                    {milestone.tasks && milestone.tasks.length > 0 && (
                      <div>
                        <span className="font-medium">Tasks:</span> {milestone.tasks.length}
                      </div>
                    )}
                    {milestone.changeOrders && milestone.changeOrders.length > 0 && (
                      <div>
                        <span className="font-medium">Change Orders:</span>{' '}
                        {milestone.changeOrders.length}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {milestone.isLocked &&
                    milestone.changeOrders &&
                    milestone.changeOrders.length > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewChangeOrders(milestone.id)}
                      >
                        View Change Orders
                      </Button>
                    )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onLock(milestone.id, !milestone.isLocked)}
                  >
                    {milestone.isLocked ? 'Unlock' : 'Lock'}
                  </Button>
                  {!milestone.isLocked && (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => onEdit(milestone)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => onDelete(milestone.id)}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
