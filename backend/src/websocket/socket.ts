import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { prisma } from '../config/database';
import { registerEventHandlers } from './events';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export interface AuthenticatedSocket extends Socket {
  user?: TokenPayload;
}

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server with Redis adapter and JWT authentication
 * @param httpServer - HTTP server instance
 * @returns Socket.io server instance
 */
export async function initializeSocketServer(httpServer: HTTPServer): Promise<SocketIOServer> {
  // Create Socket.io server with CORS configuration
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [FRONTEND_URL, 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Set up Redis adapter for horizontal scaling
  const pubClient = createClient({ url: REDIS_URL });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));

  console.log('Socket.io server initialized with Redis adapter');

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Extract token from handshake auth or query
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '') ||
        socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const payload = verifyAccessToken(token as string);

      // Verify user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          tenantMemberships: {
            include: {
              tenant: true,
            },
          },
        },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      if (!user.emailVerified) {
        return next(new Error('Email not verified'));
      }

      // Attach user info to socket
      socket.user = payload;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.user?.userId} (${socket.id})`);

    // Join user's personal room for direct notifications
    socket.join(`user:${socket.user?.userId}`);

    // Join tenant room
    socket.join(`tenant:${socket.user?.tenantId}`);

    // Register event handlers
    registerEventHandlers(socket);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.user?.userId} (${socket.id}) - ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user?.userId}:`, error);
    });
  });

  return io;
}

/**
 * Get the Socket.io server instance
 * @returns Socket.io server instance or null if not initialized
 */
export function getSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Emit event to specific user
 * @param userId - User ID
 * @param event - Event name
 * @param data - Event data
 */
export function emitToUser(userId: string, event: string, data: any): void {
  if (!io) {
    console.warn('Socket.io server not initialized');
    return;
  }
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit event to all users in a tenant
 * @param tenantId - Tenant ID
 * @param event - Event name
 * @param data - Event data
 */
export function emitToTenant(tenantId: string, event: string, data: any): void {
  if (!io) {
    console.warn('Socket.io server not initialized');
    return;
  }
  io.to(`tenant:${tenantId}`).emit(event, data);
}

/**
 * Emit event to all users in a project
 * @param tenantId - Tenant ID
 * @param projectId - Project ID
 * @param event - Event name
 * @param data - Event data
 */
export function emitToProject(tenantId: string, projectId: string, event: string, data: any): void {
  if (!io) {
    console.warn('Socket.io server not initialized');
    return;
  }
  io.to(`tenant:${tenantId}:project:${projectId}`).emit(event, data);
}

/**
 * Emit event to all users in a channel
 * @param tenantId - Tenant ID
 * @param channelId - Channel ID
 * @param event - Event name
 * @param data - Event data
 */
export function emitToChannel(
  tenantId: string,
  channelId: string,
  event: string,
  data: unknown
): void {
  if (!io) {
    console.warn('Socket.io server not initialized');
    return;
  }
  io.to(`tenant:${tenantId}:channel:${channelId}`).emit(event, data);
}

export default io;
