'use client';

import { ChangeOrder } from '@/lib/api/milestone';
import { format } from 'date-fns';
import { Button } from '../ui/Button';

interface ChangeOrderListProps {
  changeOrders: ChangeOrder[];
  onEdit: (changeOrder: ChangeOrder) => void;
  onDelete: (changeOrderId: string) => void;
  onUpdateStatus: (changeOrderId: string, status: 'pending' | 'approved' | 'rejected') => void;
}

export default function ChangeOrderList({
  changeOrders,
  onEdit,
  onDelete,
  onUpdateStatus,
}: ChangeOrderListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (changeOrders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No change orders for this milestone.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {changeOrders.map((changeOrder) => (
        <div
          key={changeOrder.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {changeOrder.title}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(changeOrder.status)}`}
                >
                  {changeOrder.status.charAt(0).toUpperCase() + changeOrder.status.slice(1)}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {changeOrder.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {changeOrder.milestone && (
                  <div>
                    <span className="font-medium">Milestone:</span> {changeOrder.milestone.name}
                  </div>
                )}
                {changeOrder.createdBy && (
                  <div>
                    <span className="font-medium">Created by:</span> {changeOrder.createdBy.name}
                  </div>
                )}
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {format(new Date(changeOrder.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {changeOrder.status === 'pending' && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onUpdateStatus(changeOrder.id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onUpdateStatus(changeOrder.id, 'rejected')}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button variant="secondary" size="sm" onClick={() => onEdit(changeOrder)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(changeOrder.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
