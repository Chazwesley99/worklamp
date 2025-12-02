'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

interface SocketResponse {
  success: boolean;
  error?: string;
}

type SocketEventHandler = (...args: unknown[]) => void;

interface SocketContextValue {
  socket: Socket | null;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  joinProject: (projectId: string) => Promise<void>;
  leaveProject: (projectId: string) => Promise<void>;
  joinChannel: (channelId: string) => Promise<void>;
  leaveChannel: (channelId: string) => Promise<void>;
  emit: (event: string, data: unknown) => void;
  on: (event: string, handler: SocketEventHandler) => void;
  off: (event: string, handler: SocketEventHandler) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
  token?: string | null;
}

export function SocketProvider({ children, token }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!token) {
      // No token, disconnect if connected
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnectionStatus('disconnected');
      }
      return;
    }

    setConnectionStatus('connecting');

    // Create socket connection with authentication
    const newSocket = io(BACKEND_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
      timeout: 20000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionStatus('disconnected');

      // Attempt manual reconnection for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Server or client initiated disconnect, don't auto-reconnect
        return;
      }

      // Auto-reconnect with exponential backoff
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current++;
          newSocket.connect();
        }, delay);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnectionStatus('error');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionStatus('error');
    });

    // Heartbeat to keep connection alive
    const heartbeatInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('heartbeat', () => {
          // Connection is alive
        });
      }
    }, 25000); // Every 25 seconds

    setSocket(newSocket);

    // Cleanup on unmount or token change
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      clearInterval(heartbeatInterval);
      newSocket.disconnect();
    };
  }, [token]);

  // Join a project room
  const joinProject = useCallback(
    async (projectId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socket || !socket.connected) {
          reject(new Error('Socket not connected'));
          return;
        }

        socket.emit('join:project', { projectId }, (response: SocketResponse) => {
          if (response?.success) {
            resolve();
          } else {
            reject(new Error(response?.error || 'Failed to join project'));
          }
        });
      });
    },
    [socket]
  );

  // Leave a project room
  const leaveProject = useCallback(
    async (projectId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socket || !socket.connected) {
          reject(new Error('Socket not connected'));
          return;
        }

        socket.emit('leave:project', { projectId }, (response: SocketResponse) => {
          if (response?.success) {
            resolve();
          } else {
            reject(new Error(response?.error || 'Failed to leave project'));
          }
        });
      });
    },
    [socket]
  );

  // Join a channel room
  const joinChannel = useCallback(
    async (channelId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socket || !socket.connected) {
          reject(new Error('Socket not connected'));
          return;
        }

        socket.emit('join:channel', { channelId }, (response: SocketResponse) => {
          if (response?.success) {
            resolve();
          } else {
            reject(new Error(response?.error || 'Failed to join channel'));
          }
        });
      });
    },
    [socket]
  );

  // Leave a channel room
  const leaveChannel = useCallback(
    async (channelId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socket || !socket.connected) {
          reject(new Error('Socket not connected'));
          return;
        }

        socket.emit('leave:channel', { channelId }, (response: SocketResponse) => {
          if (response?.success) {
            resolve();
          } else {
            reject(new Error(response?.error || 'Failed to leave channel'));
          }
        });
      });
    },
    [socket]
  );

  // Emit an event
  const emit = useCallback(
    (event: string, data: unknown) => {
      if (socket && socket.connected) {
        socket.emit(event, data);
      }
    },
    [socket]
  );

  // Subscribe to an event
  const on = useCallback(
    (event: string, handler: SocketEventHandler) => {
      if (socket) {
        socket.on(event, handler);
      }
    },
    [socket]
  );

  // Unsubscribe from an event
  const off = useCallback(
    (event: string, handler: SocketEventHandler) => {
      if (socket) {
        socket.off(event, handler);
      }
    },
    [socket]
  );

  const value: SocketContextValue = {
    socket,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    joinProject,
    leaveProject,
    joinChannel,
    leaveChannel,
    emit,
    on,
    off,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
