import { AuthenticatedSocket, getSocketServer } from './socket';
import { prisma } from '../config/database';

/**
 * Join a project room
 * @param socket - Authenticated socket
 * @param projectId - Project ID
 */
export async function joinProjectRoom(
  socket: AuthenticatedSocket,
  projectId: string
): Promise<void> {
  if (!socket.user) {
    throw new Error('Socket not authenticated');
  }

  // Verify user has access to the project
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      tenantId: socket.user.tenantId,
    },
  });

  if (!project) {
    throw new Error('Project not found or access denied');
  }

  const roomName = `tenant:${socket.user.tenantId}:project:${projectId}`;
  socket.join(roomName);
  console.log(`User ${socket.user.userId} joined project room: ${roomName}`);
}

/**
 * Leave a project room
 * @param socket - Authenticated socket
 * @param projectId - Project ID
 */
export function leaveProjectRoom(socket: AuthenticatedSocket, projectId: string): void {
  if (!socket.user) {
    throw new Error('Socket not authenticated');
  }

  const roomName = `tenant:${socket.user.tenantId}:project:${projectId}`;
  socket.leave(roomName);
  console.log(`User ${socket.user.userId} left project room: ${roomName}`);
}

/**
 * Join a channel room
 * @param socket - Authenticated socket
 * @param channelId - Channel ID
 */
export async function joinChannelRoom(
  socket: AuthenticatedSocket,
  channelId: string
): Promise<void> {
  if (!socket.user) {
    throw new Error('Socket not authenticated');
  }

  // Verify user has permission to view the channel
  const channel = await prisma.channel.findFirst({
    where: {
      id: channelId,
      project: {
        tenantId: socket.user.tenantId,
      },
    },
    include: {
      permissions: {
        where: {
          userId: socket.user.userId,
        },
      },
    },
  });

  if (!channel) {
    throw new Error('Channel not found or access denied');
  }

  // Check if channel is private and user has permission
  if (channel.isPrivate) {
    const hasPermission = channel.permissions.some((p: any) => p.canView);
    if (!hasPermission) {
      throw new Error('No permission to view this channel');
    }
  }

  const roomName = `tenant:${socket.user.tenantId}:channel:${channelId}`;
  socket.join(roomName);
  console.log(`User ${socket.user.userId} joined channel room: ${roomName}`);
}

/**
 * Leave a channel room
 * @param socket - Authenticated socket
 * @param channelId - Channel ID
 */
export function leaveChannelRoom(socket: AuthenticatedSocket, channelId: string): void {
  if (!socket.user) {
    throw new Error('Socket not authenticated');
  }

  const roomName = `tenant:${socket.user.tenantId}:channel:${channelId}`;
  socket.leave(roomName);
  console.log(`User ${socket.user.userId} left channel room: ${roomName}`);
}

/**
 * Get all users in a room
 * @param roomName - Room name
 * @returns Array of socket IDs in the room
 */
export async function getUsersInRoom(roomName: string): Promise<string[]> {
  const io = getSocketServer();
  if (!io) {
    return [];
  }

  const sockets = await io.in(roomName).fetchSockets();
  return sockets.map((socket) => socket.id);
}

/**
 * Get room count for a specific room
 * @param roomName - Room name
 * @returns Number of users in the room
 */
export async function getRoomCount(roomName: string): Promise<number> {
  const users = await getUsersInRoom(roomName);
  return users.length;
}

/**
 * Broadcast connection status to a room
 * @param roomName - Room name
 * @param userId - User ID
 * @param status - Connection status (online/offline)
 */
export function broadcastUserStatus(
  roomName: string,
  userId: string,
  status: 'online' | 'offline'
): void {
  const io = getSocketServer();
  if (!io) {
    return;
  }

  io.to(roomName).emit('user:status', {
    userId,
    status,
    timestamp: new Date().toISOString(),
  });
}
