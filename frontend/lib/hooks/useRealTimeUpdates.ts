'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../contexts/SocketContext';

interface TaskEventData {
  task?: {
    id: string;
    [key: string]: unknown;
  };
  taskId?: string;
  timestamp: string;
}

interface BugEventData {
  bug?: {
    id: string;
    [key: string]: unknown;
  };
  timestamp: string;
}

interface FeatureEventData {
  feature?: {
    id: string;
    [key: string]: unknown;
  };
  timestamp: string;
}

interface MessageEventData {
  message?: {
    id: string;
    channelId: string;
    [key: string]: unknown;
  };
  timestamp: string;
}

interface NotificationEventData {
  notification?: {
    id: string;
    [key: string]: unknown;
  };
  timestamp: string;
}

interface TypingEventData {
  userId: string;
  channelId: string;
  isTyping: boolean;
}

interface RealTimeUpdateOptions {
  projectId?: string;
  channelId?: string;
  onTaskCreated?: (data: TaskEventData) => void;
  onTaskUpdated?: (data: TaskEventData) => void;
  onTaskDeleted?: (data: TaskEventData) => void;
  onBugCreated?: (data: BugEventData) => void;
  onBugUpdated?: (data: BugEventData) => void;
  onFeatureCreated?: (data: FeatureEventData) => void;
  onFeatureUpdated?: (data: FeatureEventData) => void;
  onMessageNew?: (data: MessageEventData) => void;
  onNotificationNew?: (data: NotificationEventData) => void;
  onUserTyping?: (data: TypingEventData) => void;
  autoInvalidateQueries?: boolean;
}

/**
 * Hook for subscribing to real-time updates
 * Automatically joins/leaves rooms and handles event subscriptions
 */
export function useRealTimeUpdates(options: RealTimeUpdateOptions = {}) {
  const {
    projectId,
    channelId,
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
    onBugCreated,
    onBugUpdated,
    onFeatureCreated,
    onFeatureUpdated,
    onMessageNew,
    onNotificationNew,
    onUserTyping,
    autoInvalidateQueries = true,
  } = options;

  const { socket, isConnected, joinProject, leaveProject, joinChannel, leaveChannel, on, off } =
    useSocket();
  const queryClient = useQueryClient();
  const hasJoinedProject = useRef(false);
  const hasJoinedChannel = useRef(false);

  // Join project room when connected
  useEffect(() => {
    if (!isConnected || !projectId || hasJoinedProject.current) return;

    joinProject(projectId)
      .then(() => {
        hasJoinedProject.current = true;
        console.log('Joined project room:', projectId);
      })
      .catch((error) => {
        console.error('Failed to join project room:', error);
      });

    return () => {
      if (hasJoinedProject.current) {
        leaveProject(projectId).catch(console.error);
        hasJoinedProject.current = false;
      }
    };
  }, [isConnected, projectId, joinProject, leaveProject]);

  // Join channel room when connected
  useEffect(() => {
    if (!isConnected || !channelId || hasJoinedChannel.current) return;

    joinChannel(channelId)
      .then(() => {
        hasJoinedChannel.current = true;
        console.log('Joined channel room:', channelId);
      })
      .catch((error) => {
        console.error('Failed to join channel room:', error);
      });

    return () => {
      if (hasJoinedChannel.current) {
        leaveChannel(channelId).catch(console.error);
        hasJoinedChannel.current = false;
      }
    };
  }, [isConnected, channelId, joinChannel, leaveChannel]);

  // Task events
  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (data: TaskEventData) => {
      console.log('Task created:', data);
      onTaskCreated?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      }
    };

    const handleTaskUpdated = (data: TaskEventData) => {
      console.log('Task updated:', data);
      onTaskUpdated?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['task', data.task?.id] });
      }
    };

    const handleTaskDeleted = (data: TaskEventData) => {
      console.log('Task deleted:', data);
      onTaskDeleted?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    };

    on('task:created', handleTaskCreated as (...args: unknown[]) => void);
    on('task:updated', handleTaskUpdated as (...args: unknown[]) => void);
    on('task:deleted', handleTaskDeleted as (...args: unknown[]) => void);

    return () => {
      off('task:created', handleTaskCreated as (...args: unknown[]) => void);
      off('task:updated', handleTaskUpdated as (...args: unknown[]) => void);
      off('task:deleted', handleTaskDeleted as (...args: unknown[]) => void);
    };
  }, [
    socket,
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
    autoInvalidateQueries,
    queryClient,
    on,
    off,
  ]);

  // Bug events
  useEffect(() => {
    if (!socket) return;

    const handleBugCreated = (data: BugEventData) => {
      console.log('Bug created:', data);
      onBugCreated?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['bugs'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      }
    };

    const handleBugUpdated = (data: BugEventData) => {
      console.log('Bug updated:', data);
      onBugUpdated?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['bugs'] });
        queryClient.invalidateQueries({ queryKey: ['bug', data.bug?.id] });
      }
    };

    on('bug:created', handleBugCreated as (...args: unknown[]) => void);
    on('bug:updated', handleBugUpdated as (...args: unknown[]) => void);

    return () => {
      off('bug:created', handleBugCreated as (...args: unknown[]) => void);
      off('bug:updated', handleBugUpdated as (...args: unknown[]) => void);
    };
  }, [socket, onBugCreated, onBugUpdated, autoInvalidateQueries, queryClient, on, off]);

  // Feature request events
  useEffect(() => {
    if (!socket) return;

    const handleFeatureCreated = (data: FeatureEventData) => {
      console.log('Feature created:', data);
      onFeatureCreated?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['features'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      }
    };

    const handleFeatureUpdated = (data: FeatureEventData) => {
      console.log('Feature updated:', data);
      onFeatureUpdated?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['features'] });
        queryClient.invalidateQueries({ queryKey: ['feature', data.feature?.id] });
      }
    };

    on('feature:created', handleFeatureCreated as (...args: unknown[]) => void);
    on('feature:updated', handleFeatureUpdated as (...args: unknown[]) => void);

    return () => {
      off('feature:created', handleFeatureCreated as (...args: unknown[]) => void);
      off('feature:updated', handleFeatureUpdated as (...args: unknown[]) => void);
    };
  }, [socket, onFeatureCreated, onFeatureUpdated, autoInvalidateQueries, queryClient, on, off]);

  // Message events
  useEffect(() => {
    if (!socket) return;

    const handleMessageNew = (data: MessageEventData) => {
      console.log('New message:', data);
      onMessageNew?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['messages', data.message?.channelId] });
        queryClient.invalidateQueries({ queryKey: ['channels'] });
      }
    };

    on('message:new', handleMessageNew as (...args: unknown[]) => void);

    return () => {
      off('message:new', handleMessageNew as (...args: unknown[]) => void);
    };
  }, [socket, onMessageNew, autoInvalidateQueries, queryClient, on, off]);

  // Notification events
  useEffect(() => {
    if (!socket) return;

    const handleNotificationNew = (data: NotificationEventData) => {
      console.log('New notification:', data);
      onNotificationNew?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    };

    on('notification:new', handleNotificationNew as (...args: unknown[]) => void);

    return () => {
      off('notification:new', handleNotificationNew as (...args: unknown[]) => void);
    };
  }, [socket, onNotificationNew, autoInvalidateQueries, queryClient, on, off]);

  // Typing indicator events
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data: TypingEventData) => {
      onUserTyping?.(data);
    };

    on('user:typing', handleUserTyping as (...args: unknown[]) => void);

    return () => {
      off('user:typing', handleUserTyping as (...args: unknown[]) => void);
    };
  }, [socket, onUserTyping, on, off]);

  return {
    isConnected,
  };
}

/**
 * Hook for sending typing indicators
 */
export function useTypingIndicator(channelId?: string) {
  const { emit, isConnected } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (!isConnected || !channelId) return;

    emit('typing:start', { channelId });

    // Auto-stop typing after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emit('typing:stop', { channelId });
    }, 3000);
  }, [emit, isConnected, channelId]);

  const stopTyping = useCallback(() => {
    if (!isConnected || !channelId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    emit('typing:stop', { channelId });
  }, [emit, isConnected, channelId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    startTyping,
    stopTyping,
  };
}
