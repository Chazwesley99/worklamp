'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import MilestoneTimeline from '@/components/milestone/MilestoneTimeline';
import MilestoneForm from '@/components/milestone/MilestoneForm';
import ChangeOrderForm from '@/components/milestone/ChangeOrderForm';
import ChangeOrderList from '@/components/milestone/ChangeOrderList';
import {
  type Milestone,
  type ChangeOrder,
  type CreateMilestoneInput,
  type UpdateMilestoneInput,
  type CreateChangeOrderInput,
  type UpdateChangeOrderInput,
  milestoneApi,
} from '@/lib/api/milestone';
import { useProject } from '@/lib/contexts/ProjectContext';
import { useToast } from '@/lib/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function MilestonesPage() {
  const { selectedProject } = useProject();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMilestoneFormOpen, setIsMilestoneFormOpen] = useState(false);
  const [isChangeOrderFormOpen, setIsChangeOrderFormOpen] = useState(false);
  const [isChangeOrderListOpen, setIsChangeOrderListOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [selectedChangeOrder, setSelectedChangeOrder] = useState<ChangeOrder | null>(null);
  const [selectedMilestoneForChangeOrders, setSelectedMilestoneForChangeOrders] = useState<
    string | null
  >(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (selectedProject) {
      loadMilestones(selectedProject.id);
    }
  }, [selectedProject]);

  const loadMilestones = async (projectId: string) => {
    try {
      setIsLoading(true);
      const data = await milestoneApi.getMilestones(projectId);
      setMilestones(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load milestones';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      setMilestones([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChangeOrders = async (projectId: string) => {
    try {
      const data = await milestoneApi.getChangeOrders(projectId);
      setChangeOrders(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load change orders';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      setChangeOrders([]);
    }
  };

  // Milestone handlers
  const handleCreateMilestone = () => {
    setSelectedMilestone(null);
    setIsMilestoneFormOpen(true);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsMilestoneFormOpen(true);
  };

  const handleSubmitMilestone = async (data: CreateMilestoneInput | UpdateMilestoneInput) => {
    if (!selectedProject) return;

    try {
      if (selectedMilestone) {
        await milestoneApi.updateMilestone(selectedMilestone.id, data as UpdateMilestoneInput);
        showToast('Milestone updated successfully', 'success');
      } else {
        await milestoneApi.createMilestone(selectedProject.id, data as CreateMilestoneInput);
        showToast('Milestone created successfully', 'success');
      }
      loadMilestones(selectedProject.id);
      setIsMilestoneFormOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save milestone';
      showToast(message, 'error');
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!selectedProject || !confirm('Are you sure you want to delete this milestone?')) return;

    try {
      await milestoneApi.deleteMilestone(milestoneId);
      showToast('Milestone deleted successfully', 'success');
      loadMilestones(selectedProject.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete milestone';
      showToast(message, 'error');
    }
  };

  const handleLockMilestone = async (milestoneId: string, isLocked: boolean) => {
    if (!selectedProject) return;

    try {
      await milestoneApi.lockMilestone(milestoneId, isLocked);
      showToast(`Milestone ${isLocked ? 'locked' : 'unlocked'} successfully`, 'success');
      loadMilestones(selectedProject.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to lock milestone';
      showToast(message, 'error');
    }
  };

  const handleViewChangeOrders = async (milestoneId: string) => {
    if (!selectedProject) return;
    setSelectedMilestoneForChangeOrders(milestoneId);
    await loadChangeOrders(selectedProject.id);
    setIsChangeOrderListOpen(true);
  };

  // Change order handlers
  const handleCreateChangeOrder = () => {
    setSelectedChangeOrder(null);
    setIsChangeOrderFormOpen(true);
  };

  const handleEditChangeOrder = (changeOrder: ChangeOrder) => {
    setSelectedChangeOrder(changeOrder);
    setIsChangeOrderFormOpen(true);
  };

  const handleSubmitChangeOrder = async (data: CreateChangeOrderInput | UpdateChangeOrderInput) => {
    if (!selectedProject) return;

    try {
      if (selectedChangeOrder) {
        await milestoneApi.updateChangeOrder(
          selectedChangeOrder.id,
          data as UpdateChangeOrderInput
        );
        showToast('Change order updated successfully', 'success');
      } else {
        await milestoneApi.createChangeOrder(selectedProject.id, data as CreateChangeOrderInput);
        showToast('Change order created successfully', 'success');
      }
      await loadChangeOrders(selectedProject.id);
      setIsChangeOrderFormOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save change order';
      showToast(message, 'error');
    }
  };

  const handleDeleteChangeOrder = async (changeOrderId: string) => {
    if (!selectedProject || !confirm('Are you sure you want to delete this change order?')) return;

    try {
      await milestoneApi.deleteChangeOrder(changeOrderId);
      showToast('Change order deleted successfully', 'success');
      await loadChangeOrders(selectedProject.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete change order';
      showToast(message, 'error');
    }
  };

  const handleUpdateChangeOrderStatus = async (
    changeOrderId: string,
    status: 'pending' | 'approved' | 'rejected'
  ) => {
    if (!selectedProject) return;

    try {
      await milestoneApi.updateChangeOrder(changeOrderId, { status });
      showToast('Change order status updated successfully', 'success');
      await loadChangeOrders(selectedProject.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update change order status';
      showToast(message, 'error');
    }
  };

  const filteredChangeOrders = selectedMilestoneForChangeOrders
    ? changeOrders.filter((co) => co.milestoneId === selectedMilestoneForChangeOrders)
    : changeOrders;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Milestones</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track project milestones and manage change orders
          </p>
        </div>

        {selectedProject ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Milestone Timeline
              </h2>
              <div className="flex gap-2">
                <Button onClick={handleCreateChangeOrder}>Create Change Order</Button>
                <Button onClick={handleCreateMilestone}>Create Milestone</Button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading milestones...
              </div>
            ) : (
              <MilestoneTimeline
                milestones={milestones}
                onEdit={handleEditMilestone}
                onDelete={handleDeleteMilestone}
                onLock={handleLockMilestone}
                onViewChangeOrders={handleViewChangeOrders}
              />
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">No project selected</p>
              <p className="text-sm">Select a project from the dropdown to view milestones</p>
            </div>
          </div>
        )}

        {/* Milestone Form Modal */}
        <MilestoneForm
          isOpen={isMilestoneFormOpen}
          onClose={() => {
            setIsMilestoneFormOpen(false);
            setSelectedMilestone(null);
          }}
          onSubmit={handleSubmitMilestone}
          milestone={selectedMilestone}
        />

        {/* Change Order Form Modal */}
        <ChangeOrderForm
          isOpen={isChangeOrderFormOpen}
          onClose={() => {
            setIsChangeOrderFormOpen(false);
            setSelectedChangeOrder(null);
          }}
          onSubmit={handleSubmitChangeOrder}
          changeOrder={selectedChangeOrder}
          milestones={milestones}
        />

        {/* Change Order List Modal */}
        <Modal
          isOpen={isChangeOrderListOpen}
          onClose={() => {
            setIsChangeOrderListOpen(false);
            setSelectedMilestoneForChangeOrders(null);
          }}
          title="Change Orders"
        >
          <ChangeOrderList
            changeOrders={filteredChangeOrders}
            onEdit={handleEditChangeOrder}
            onDelete={handleDeleteChangeOrder}
            onUpdateStatus={handleUpdateChangeOrderStatus}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
}
