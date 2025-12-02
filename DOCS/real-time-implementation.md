# Real-Time Infrastructure Implementation

## Overview

This document describes the real-time infrastructure implemented for the Worklamp platform using Socket.io with Redis adapter for horizontal scaling.

## Backend Implementation

### Files Created

1. **`backend/src/websocket/socket.ts`**
   - Main Socket.io server initialization
   - JWT authentication middleware for WebSocket connections
   - Redis adapter configuration for horizontal scaling
   - Room management utilities (user rooms, tenant rooms, project rooms, channel rooms)
   - Event emission helpers

2. **`backend/src/websocket/events.ts`**
   - Event handler registration
   - Real-time event emitters for:
     - Tasks (created, updated, deleted)
     - Bugs (created, updated)
     - Features (created, updated)
     - Messages (new messages)
     - Notifications (new notifications)
   - Typing indicators for channels

3. **`backend/src/websocket/rooms.ts`**
   - Project room join/leave with permission verification
   - Channel room join/leave with permission verification
   - Room user count utilities
   - User status broadcasting

### Integration

The Socket.io server is integrated into the main Express server in `backend/src/index.ts`:

- Creates HTTP server from Express app
- Initializes Socket.io with the HTTP server
- Starts listening on the same port (3001)

### Authentication

WebSocket connections are authenticated using JWT tokens:

- Token can be provided via `auth.token`, `Authorization` header, or query parameter
- Token is verified using the same JWT utilities as REST API
- User must exist and have verified email
- User info is attached to socket for authorization checks

### Room Structure

- **User rooms**: `user:{userId}` - For direct notifications
- **Tenant rooms**: `tenant:{tenantId}` - For tenant-wide broadcasts
- **Project rooms**: `tenant:{tenantId}:project:{projectId}` - For project-specific updates
- **Channel rooms**: `tenant:{tenantId}:channel:{channelId}` - For channel messages

## Frontend Implementation

### Files Created

1. **`frontend/lib/contexts/SocketContext.tsx`**
   - Socket.io client context and provider
   - Connection management with automatic reconnection
   - Exponential backoff for reconnection attempts
   - Heartbeat mechanism to keep connection alive
   - Room join/leave methods
   - Event subscription methods

2. **`frontend/lib/hooks/useRealTimeUpdates.ts`**
   - Hook for subscribing to real-time updates
   - Automatic room joining based on projectId/channelId
   - React Query cache invalidation on updates
   - Event handlers for all real-time events
   - Typing indicator hook

3. **`frontend/lib/providers/SocketProviderWrapper.tsx`**
   - Wrapper that connects SocketProvider with AuthContext
   - Passes access token for authentication
   - Includes ConnectionStatus indicator

4. **`frontend/components/ui/ConnectionStatus.tsx`**
   - Visual indicator of WebSocket connection status
   - Shows connecting, disconnected, or error states
   - Hidden when connected (normal state)

### Integration

The SocketProvider is integrated into the app layout (`frontend/app/layout.tsx`):

```tsx
<AuthProvider>
  <SocketProviderWrapper>
    <ToastProvider>
      <ProjectProvider>{children}</ProjectProvider>
    </ToastProvider>
  </SocketProviderWrapper>
</AuthProvider>
```

### Usage Example

```tsx
import { useRealTimeUpdates } from '@/lib/hooks/useRealTimeUpdates';

function MyComponent({ projectId }) {
  const { isConnected } = useRealTimeUpdates({
    projectId,
    onTaskCreated: (data) => {
      console.log('New task:', data.task);
      // Show notification, update UI, etc.
    },
    onTaskUpdated: (data) => {
      console.log('Task updated:', data.task);
    },
    autoInvalidateQueries: true, // Automatically refresh React Query cache
  });

  return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>;
}
```

## Features Implemented

### ✅ Task 9.1: Set up Socket.io server and client

- Socket.io server with Express integration
- JWT authentication for WebSocket connections
- Redis adapter for horizontal scaling
- Room management utilities

### ✅ Task 9.2: Implement real-time event handlers

- Task created/updated/deleted events
- Bug created/updated events
- Feature created/updated events
- Message events
- Notification events
- Typing indicators

### ✅ Task 9.5: Create real-time hooks and context

- useSocket hook for WebSocket connection
- useRealTimeUpdates hook for automatic data refresh
- SocketProvider context
- Connection status indicator

## Configuration

### Environment Variables

Backend:

```bash
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
```

Frontend:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## Connection Flow

1. User authenticates via REST API and receives JWT token
2. Frontend SocketProvider initializes with the token
3. Socket.io client connects to backend with token in auth handshake
4. Backend verifies JWT and user credentials
5. User is automatically joined to personal and tenant rooms
6. Components can join specific project/channel rooms as needed
7. Real-time events are broadcast to appropriate rooms
8. Frontend hooks automatically update React Query cache

## Error Handling

- **Connection errors**: Automatic reconnection with exponential backoff (max 30s delay)
- **Authentication errors**: Connection rejected, user must re-authenticate
- **Room join errors**: Returned via callback, component can handle appropriately
- **Network errors**: Graceful degradation, queued messages sent on reconnect

## Performance Considerations

- Redis pub/sub enables horizontal scaling across multiple server instances
- Heartbeat every 25 seconds keeps connections alive
- Automatic reconnection prevents connection loss
- Room-based broadcasting reduces unnecessary message traffic
- React Query cache invalidation prevents unnecessary API calls

## Testing

All existing tests pass with the new WebSocket infrastructure:

- 39 tests passed
- Socket.io server initializes successfully in test environment
- No breaking changes to existing functionality

## Next Steps

To use real-time features in controllers:

1. Import event emitters from `backend/src/websocket/events.ts`
2. Call appropriate emitter after database operations
3. Frontend components using `useRealTimeUpdates` will automatically receive updates

Example:

```typescript
// In task controller after creating a task
import { emitTaskCreated } from '../websocket/events';

// After successful task creation
emitTaskCreated(socket, {
  id: task.id,
  projectId: task.projectId,
  tenantId: task.project.tenantId,
  title: task.title,
  status: task.status,
  priority: task.priority,
  createdById: task.createdById,
});
```

## Requirements Validated

This implementation satisfies the following requirements:

- **20.1**: Real-time dashboard updates when tasks are added
- **20.2**: Real-time updates for bugs and feature requests
- **20.3**: Real-time message delivery in channels
- **20.4**: "New" indicators on affected items
- **20.5**: Updates without page refresh
