'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../contexts/SocketContext';

interface RealTimeUpdateOptions {
  projectId?: string;
  channelId?: string;
  onTaskCreated?: (data: any) => void;
  onTaskUpdated?: (data: any) => void;
  onTaskDeleted?: (data: any) => void;
  onBugCreated?: (data: any) => void;
  onBugUpdated?: (data: any) => void;
  onFeatureCreated?: (data: any) => void;
  onFeatureUpdated?: (data: any) => void;
  onMessageNew?: (data: any) => void;
  onNotificationNew?: (data: any) => void;
  onUserTyping?: (data: any) => void;
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

    const handleTaskCreated = (data: any) => {
      console.log('Task created:', data);
      onTaskCreated?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      }
    };

    const handleTaskUpdated = (data: any) => {
      console.log('Task updated:', data);
      onTaskUpdated?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['task', data.task?.id] });
      }
    };

    const handleTaskDeleted = (data: any) => {
      console.log('Task deleted:', data);
      onTaskDeleted?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    };

    on('task:created', handleTaskCreated);
    on('task:updated', handleTaskUpdated);
    on('task:deleted', handleTaskDeleted);

    return () => {
      off('task:created', handleTaskCreated);
      off('task:updated', handleTaskUpdated);
      off('task:deleted', handleTaskDeleted);
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

    const handleBugCreated = (data: any) => {
      console.log('Bug created:', data);
      onBugCreated?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['bugs'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      }
    };

    const handleBugUpdated = (data: any) => {
      console.log('Bug updated:', data);
      onBugUpdated?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['bugs'] });
        queryClient.invalidateQueries({ queryKey: ['bug', data.bug?.id] });
      }
    };

    on('bug:created', handleBugCreated);
    on('bug:updated', handleBugUpdated);

    return () => {
      off('bug:created', handleBugCreated);
      off('bug:updated', handleBugUpdated);
    };
  }, [socket, onBugCreated, onBugUpdated, autoInvalidateQueries, queryClient, on, off]);

  // Feature request events
  useEffect(() => {
    if (!socket) return;

    const handleFeatureCreated = (data: any) => {
      console.log('Feature created:', data);
      onFeatureCreated?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['features'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      }
    };

    const handleFeatureUpdated = (data: any) => {
      console.log('Feature updated:', data);
      onFeatureUpdated?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['features'] });
        queryClient.invalidateQueries({ queryKey: ['feature', data.feature?.id] });
      }
    };

    on('feature:created', handleFeatureCreated);
    on('feature:updated', handleFeatureUpdated);

    return () => {
      off('feature:created', handleFeatureCreated);
      off('feature:updated', handleFeatureUpdated);
    };
  }, [socket, onFeatureCreated, onFeatureUpdated, autoInvalidateQueries, queryClient, on, off]);

  // Message events
  useEffect(() => {
    if (!socket) return;

    const handleMessageNew = (data: any) => {
      console.log('New message:', data);
      onMessageNew?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['messages', data.message?.channelId] });
        queryClient.invalidateQueries({ queryKey: ['channels'] });
      }
    };

    on('message:new', handleMessageNew);

    return () => {
      off('message:new', handleMessageNew);
    };
  }, [socket, onMessageNew, autoInvalidateQueries, queryClient, on, off]);

  // Notification events
  useEffect(() => {
    if (!socket) return;

    const handleNotificationNew = (data: any) => {
      console.log('New notification:', data);
      onNotificationNew?.(data);
      if (autoInvalidateQueries) {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    };

    on('notification:new', handleNotificationNew);

    return () => {
      off('notification:new', handleNotificationNew);
    };
  }, [socket, onNotificationNew, autoInvalidateQueries, queryClient, on, off]);

  // Typing indicator events
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data: any) => {
      onUserTyping?.(data);
    };

    on('user:typing', handleUserTyping);

    return () => {
      off('user:typing', handleUserTyping);
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
