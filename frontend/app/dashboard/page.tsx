'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectList } from '@/components/project/ProjectList';
import { ProjectForm } from '@/components/project/ProjectForm';
import { TaskList } from '@/components/task/TaskList';
import { BugList } from '@/components/bug/BugList';
import FeatureRequestList from '@/components/feature/FeatureRequestList';
import MilestoneTimeline from '@/components/milestone/MilestoneTimeline';
import MilestoneForm from '@/components/milestone/MilestoneForm';
import ChangeOrderForm from '@/components/milestone/ChangeOrderForm';
import ChangeOrderList from '@/components/milestone/ChangeOrderList';
import { type Task, taskApi } from '@/lib/api/task';
import { type Bug, bugApi } from '@/lib/api/bug';
import { type FeatureRequest, featureApi } from '@/lib/api/feature';
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

export default function DashboardPage() {
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const { selectedProject, refreshProjects } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingBugs, setIsLoadingBugs] = useState(false);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [activeTab, setActiveTab] = useState<'milestones' | 'tasks' | 'bugs' | 'features'>('tasks');
  const [isMilestoneFormOpen, setIsMilestoneFormOpen] = useState(false);
  const [isChangeOrderFormOpen, setIsChangeOrderFormOpen] = useState(false);
  const [isChangeOrderListOpen, setIsChangeOrderListOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [selectedChangeOrder, setSelectedChangeOrder] = useState<ChangeOrder | null>(null);
  const [selectedMilestoneForChangeOrders, setSelectedMilestoneForChangeOrders] = useState<
    string | null
  >(null);
  const { showToast } = useToast();

  // Load tasks, bugs, features, and milestones when a project is selected
  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject.id);
      loadBugs(selectedProject.id);
      loadFeatures(selectedProject.id);

      // Only load milestones if enabled for this project
      if (selectedProject.useMilestones) {
        loadMilestones(selectedProject.id);
      } else {
        setMilestones([]);
      }

      // Switch to tasks tab if milestones are disabled and we're on milestones tab
      if (!selectedProject.useMilestones && activeTab === 'milestones') {
        setActiveTab('tasks');
      }
    }
  }, [selectedProject]);

  const loadTasks = async (projectId: string) => {
    try {
      setIsLoadingTasks(true);
      const data = await taskApi.getTasks(projectId);
      setTasks(data.tasks);
    } catch (error) {
      // Only show error toast if it's not a 404 (no tasks is expected for new projects)
      const message = error instanceof Error ? error.message : 'Failed to load tasks';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      setTasks([]);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const loadBugs = async (projectId: string) => {
    try {
      setIsLoadingBugs(true);
      const data = await bugApi.getBugs(projectId);
      setBugs(data);
    } catch (error) {
      // Only show error toast if it's not a 404 (no bugs is expected for new projects)
      const message = error instanceof Error ? error.message : 'Failed to load bugs';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      setBugs([]);
    } finally {
      setIsLoadingBugs(false);
    }
  };

  const loadFeatures = async (projectId: string) => {
    try {
      setIsLoadingFeatures(true);
      const data = await featureApi.getFeatures(projectId);
      setFeatures(data);
    } catch (error) {
      // Only show error toast if it's not a 404 (no features is expected for new projects)
      const message = error instanceof Error ? error.message : 'Failed to load feature requests';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      setFeatures([]);
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  const loadMilestones = async (projectId: string) => {
    try {
      setIsLoadingMilestones(true);
      const data = await milestoneApi.getMilestones(projectId);
      setMilestones(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load milestones';
      if (!message.includes('404') && !message.includes('not found')) {
        showToast(message, 'error');
      }
      setMilestones([]);
    } finally {
      setIsLoadingMilestones(false);
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

  const handleCreateProject = () => {
    setIsProjectFormOpen(true);
  };

  const handleEditProject = () => {
    setIsProjectFormOpen(true);
  };

  const handleTasksChange = () => {
    if (selectedProject) {
      loadTasks(selectedProject.id);
    }
  };

  const handleBugsChange = () => {
    if (selectedProject) {
      loadBugs(selectedProject.id);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Manage your projects and tasks.
          </p>
        </div>

        {/* Project Content */}
        {selectedProject ? (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              {selectedProject.useMilestones && (
                <button
                  onClick={() => setActiveTab('milestones')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'milestones'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  Milestones ({milestones.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'tasks'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('bugs')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'bugs'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Bugs ({bugs.length})
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'features'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Requests ({features.length})
              </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {activeTab === 'milestones' ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Milestone Timeline
                    </h2>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateChangeOrder}>Create Change Order</Button>
                      <Button onClick={handleCreateMilestone}>Create Milestone</Button>
                    </div>
                  </div>
                  {isLoadingMilestones ? (
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
                </>
              ) : activeTab === 'tasks' ? (
                isLoadingTasks ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading tasks...
                  </div>
                ) : (
                  <TaskList
                    projectId={selectedProject.id}
                    tasks={tasks}
                    onTasksChange={handleTasksChange}
                    milestones={selectedProject.useMilestones ? milestones : []}
                  />
                )
              ) : activeTab === 'bugs' ? (
                isLoadingBugs ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Loading bugs...
                  </div>
                ) : (
                  <BugList
                    projectId={selectedProject.id}
                    bugs={bugs}
                    onBugsChange={handleBugsChange}
                  />
                )
              ) : isLoadingFeatures ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading feature requests...
                </div>
              ) : (
                <FeatureRequestList
                  projectId={selectedProject.id}
                  features={features}
                  onFeaturesChange={() => {
                    if (selectedProject) {
                      loadFeatures(selectedProject.id);
                    }
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <ProjectList onCreateProject={handleCreateProject} onEditProject={handleEditProject} />
          </div>
        )}

        <ProjectForm
          isOpen={isProjectFormOpen}
          onClose={() => {
            setIsProjectFormOpen(false);
            refreshProjects();
          }}
          project={null}
        />

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
