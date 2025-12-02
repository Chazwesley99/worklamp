import { AuthenticatedSocket } from './socket';
import { joinProjectRoom, leaveProjectRoom, joinChannelRoom, leaveChannelRoom } from './rooms';

/**
 * Register all WebSocket event handlers for a socket connection
 * @param socket - Authenticated socket
 */
export function registerEventHandlers(socket: AuthenticatedSocket): void {
  // Project room management
  socket.on('join:project', async (data: { projectId: string }, callback) => {
    try {
      await joinProjectRoom(socket, data.projectId);
      callback?.({ success: true });
    } catch (error) {
      console.error('Error joining project room:', error);
      callback?.({ success: false, error: (error as Error).message });
    }
  });

  socket.on('leave:project', (data: { projectId: string }, callback) => {
    try {
      leaveProjectRoom(socket, data.projectId);
      callback?.({ success: true });
    } catch (error) {
      console.error('Error leaving project room:', error);
      callback?.({ success: false, error: (error as Error).message });
    }
  });

  // Channel room management
  socket.on('join:channel', async (data: { channelId: string }, callback) => {
    try {
      await joinChannelRoom(socket, data.channelId);
      callback?.({ success: true });
    } catch (error) {
      console.error('Error joining channel room:', error);
      callback?.({ success: false, error: (error as Error).message });
    }
  });

  socket.on('leave:channel', (data: { channelId: string }, callback) => {
    try {
      leaveChannelRoom(socket, data.channelId);
      callback?.({ success: true });
    } catch (error) {
      console.error('Error leaving channel room:', error);
      callback?.({ success: false, error: (error as Error).message });
    }
  });

  // Typing indicators for channels
  socket.on('typing:start', (data: { channelId: string }) => {
    if (!socket.user) return;

    const roomName = `tenant:${socket.user.tenantId}:channel:${data.channelId}`;
    socket.to(roomName).emit('user:typing', {
      userId: socket.user.userId,
      channelId: data.channelId,
      isTyping: true,
    });
  });

  socket.on('typing:stop', (data: { channelId: string }) => {
    if (!socket.user) return;

    const roomName = `tenant:${socket.user.tenantId}:channel:${data.channelId}`;
    socket.to(roomName).emit('user:typing', {
      userId: socket.user.userId,
      channelId: data.channelId,
      isTyping: false,
    });
  });

  // Presence/heartbeat
  socket.on('heartbeat', (callback) => {
    callback?.({ timestamp: Date.now() });
  });
}

/**
 * Task event emitters
 */
export interface TaskEventData {
  id: string;
  projectId: string;
  tenantId: string;
  title: string;
  status: string;
  priority: number;
  createdById: string;
  [key: string]: any;
}

export function emitTaskCreated(socket: AuthenticatedSocket, task: TaskEventData): void {
  if (!socket.user) return;

  const roomName = `tenant:${task.tenantId}:project:${task.projectId}`;
  socket.to(roomName).emit('task:created', {
    task,
    timestamp: new Date().toISOString(),
  });
}

export function emitTaskUpdated(socket: AuthenticatedSocket, task: TaskEventData): void {
  if (!socket.user) return;

  const roomName = `tenant:${task.tenantId}:project:${task.projectId}`;
  socket.to(roomName).emit('task:updated', {
    task,
    timestamp: new Date().toISOString(),
  });
}

export function emitTaskDeleted(
  socket: AuthenticatedSocket,
  taskId: string,
  projectId: string,
  tenantId: string
): void {
  if (!socket.user) return;

  const roomName = `tenant:${tenantId}:project:${projectId}`;
  socket.to(roomName).emit('task:deleted', {
    taskId,
    projectId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Bug event emitters
 */
export interface BugEventData {
  id: string;
  projectId: string;
  tenantId: string;
  title: string;
  status: string;
  priority: number;
  createdById: string;
  [key: string]: any;
}

export function emitBugCreated(socket: AuthenticatedSocket, bug: BugEventData): void {
  if (!socket.user) return;

  const roomName = `tenant:${bug.tenantId}:project:${bug.projectId}`;
  socket.to(roomName).emit('bug:created', {
    bug,
    timestamp: new Date().toISOString(),
  });
}

export function emitBugUpdated(socket: AuthenticatedSocket, bug: BugEventData): void {
  if (!socket.user) return;

  const roomName = `tenant:${bug.tenantId}:project:${bug.projectId}`;
  socket.to(roomName).emit('bug:updated', {
    bug,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Feature request event emitters
 */
export interface FeatureEventData {
  id: string;
  projectId: string;
  tenantId: string;
  title: string;
  status: string;
  priority: number;
  createdById: string;
  [key: string]: any;
}

export function emitFeatureCreated(socket: AuthenticatedSocket, feature: FeatureEventData): void {
  if (!socket.user) return;

  const roomName = `tenant:${feature.tenantId}:project:${feature.projectId}`;
  socket.to(roomName).emit('feature:created', {
    feature,
    timestamp: new Date().toISOString(),
  });
}

export function emitFeatureUpdated(socket: AuthenticatedSocket, feature: FeatureEventData): void {
  if (!socket.user) return;

  const roomName = `tenant:${feature.tenantId}:project:${feature.projectId}`;
  socket.to(roomName).emit('feature:updated', {
    feature,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Message event emitters
 */
export interface MessageEventData {
  id: string;
  channelId: string;
  tenantId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export function emitMessageNew(socket: AuthenticatedSocket, message: MessageEventData): void {
  if (!socket.user) return;

  const roomName = `tenant:${message.tenantId}:channel:${message.channelId}`;
  socket.to(roomName).emit('message:new', {
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notification event emitters
 */
export interface NotificationEventData {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
}

export function emitNotificationNew(
  socket: AuthenticatedSocket,
  notification: NotificationEventData
): void {
  if (!socket.user) return;

  const roomName = `user:${notification.userId}`;
  socket.to(roomName).emit('notification:new', {
    notification,
    timestamp: new Date().toISOString(),
  });
}
