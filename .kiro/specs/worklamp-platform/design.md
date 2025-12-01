# Design Document

## Overview

Worklamp.com is a full-stack web application built with security, real-time collaboration, and developer experience as primary concerns. The platform uses a modern tech stack with Next.js for the frontend, Node.js/Express for the API layer, PostgreSQL for data persistence, and WebSocket connections for real-time updates. All services run on self-hosted infrastructure with optional cloud storage integration.

The architecture follows a multi-tenant SaaS model with strict tenant isolation at the database level. Authentication uses JWT tokens with secure httpOnly cookies, and all passwords are hashed using bcrypt. The system implements role-based access control (RBAC) throughout, with five distinct roles: Project Owner, Admin, Developer, Auditor, and Public.

## Architecture

### Technology Stack

**Frontend:**
- Next.js 14+ (App Router) - Server-side rendering, static generation, and optimal performance
- React 18+ - Component-based UI with hooks
- TypeScript - Type safety throughout the application
- Tailwind CSS - Utility-first styling with dark/light theme support
- Shadcn/ui - Accessible, customizable component library
- Socket.io-client - Real-time bidirectional communication
- React Query (TanStack Query) - Server state management and caching
- Zustand - Client state management for UI state
- Zod - Runtime type validation for forms and API responses

**Backend:**
- Node.js 20+ LTS - Runtime environment
- Express.js - API framework
- TypeScript - Type safety on the backend
- Socket.io - WebSocket server for real-time features
- Prisma - Type-safe ORM with migrations
- PostgreSQL 15+ - Primary database
- Redis - Session storage and real-time pub/sub
- Bull - Job queue for background tasks (email, image optimization)


**Authentication & Security:**
- Passport.js - Authentication middleware
- bcrypt - Password hashing (cost factor 12)
- jsonwebtoken - JWT token generation and verification
- express-rate-limit - API rate limiting
- helmet - Security headers
- express-validator - Input validation and sanitization
- Google OAuth 2.0 - Third-party authentication

**Media & Storage:**
- Sharp - Image optimization and resizing
- AWS SDK v3 - S3-compatible storage (AWS S3, DigitalOcean Spaces)
- Multer - File upload handling

**AI Integration:**
- OpenAI SDK - GPT-4 integration
- Google AI SDK - Gemini integration
- Configurable API key management (user-provided or platform-provided)

**Email:**
- Nodemailer - Email sending
- MJML - Responsive email templates
- Email verification tokens with expiration

**Testing:**
- Vitest - Unit testing framework
- React Testing Library - Component testing
- Supertest - API endpoint testing
- Playwright - E2E testing
- fast-check - Property-based testing library

**Development Tools:**
- ESLint - Code linting
- Prettier - Code formatting
- Husky - Git hooks
- Docker - Containerization for consistent environments
- Docker Compose - Multi-container orchestration


### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Marketing    │  │ Demo         │  │ Production   │      │
│  │ Site         │  │ Environment  │  │ Application  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                    Next.js Frontend                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js API Server + Socket.io WebSocket Server │   │
│  │  - Authentication Middleware                         │   │
│  │  - Rate Limiting                                     │   │
│  │  - Request Validation                                │   │
│  │  - Tenant Isolation                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│  Service Layer   │ │ Real-time    │ │ Background   │
│  - Auth Service  │ │ Service      │ │ Jobs         │
│  - Project Svc   │ │ - Socket.io  │ │ - Bull Queue │
│  - Task Service  │ │ - Redis      │ │ - Email      │
│  - Bug Service   │ │   Pub/Sub    │ │ - Image Opt  │
│  - Feature Svc   │ │              │ │ - Demo Reset │
│  - AI Service    │ │              │ │              │
└──────────────────┘ └──────────────┘ └──────────────┘
         │                   │                │
         └───────────────────┼────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │ Redis        │  │ File Storage │      │
│  │ - Tenants    │  │ - Sessions   │  │ - Local FS   │      │
│  │ - Users      │  │ - Cache      │  │ - S3/Spaces  │      │
│  │ - Projects   │  │ - Pub/Sub    │  │              │      │
│  │ - Tasks/Bugs │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```


### Multi-Tenant Architecture

The system implements tenant isolation at multiple levels:

1. **Database Level**: Each tenant has a `tenantId` foreign key on all tenant-specific tables. All queries include tenant filtering through Prisma middleware.

2. **Session Level**: JWT tokens include `tenantId` claim. Middleware validates and injects tenant context into all requests.

3. **Real-time Level**: Socket.io rooms are namespaced by tenant (e.g., `tenant:123:project:456`). Users only join rooms for their tenant.

4. **Storage Level**: Media files are organized by tenant in directory structure (`/uploads/{tenantId}/{resourceType}/{filename}`).

### Security Architecture

**Authentication Flow:**
1. User submits credentials (email/password or OAuth)
2. Server validates credentials
3. Server generates JWT with claims: `userId`, `tenantId`, `role`, `exp`
4. JWT stored in httpOnly, secure, sameSite cookie
5. Refresh token stored in Redis with 30-day expiration
6. Access token expires in 15 minutes, requires refresh

**Authorization Flow:**
1. Middleware extracts JWT from cookie
2. Middleware verifies signature and expiration
3. Middleware loads user permissions based on role
4. Route handler checks required permissions
5. Request proceeds or returns 403 Forbidden

**Input Validation:**
- All API inputs validated with Zod schemas
- SQL injection prevented by Prisma parameterized queries
- XSS prevented by React's automatic escaping + DOMPurify for rich text
- CSRF prevented by sameSite cookies + custom headers
- File uploads validated by type, size, and content inspection


## Components and Interfaces

### Frontend Components

**Layout Components:**
- `AppShell` - Main application wrapper with navigation, theme provider
- `DashboardLayout` - Dashboard-specific layout with sidebar, header
- `MarketingLayout` - Marketing site layout with footer, navigation
- `Modal` - Reusable modal component for all dialogs
- `Sidebar` - Collapsible navigation sidebar
- `Header` - Top navigation with notifications, user menu, project selector

**Feature Components:**
- `MilestoneTimeline` - Visual timeline of milestones with drag-to-reorder
- `TaskList` - Sortable, filterable task list with categories
- `TaskCard` - Individual task display with quick actions
- `BugList` - Bug tracking list with priority indicators
- `BugForm` - Bug creation/edit form with image upload
- `FeatureRequestList` - Feature request list with voting
- `FeatureRequestCard` - Individual feature request with vote button
- `ChatPanel` - Real-time chat interface with channels
- `MessageList` - Scrollable message list with auto-scroll
- `NotificationBell` - Notification dropdown with unread count
- `UserNotes` - Post-it style notes interface
- `EnvVarManager` - Environment variable CRUD interface
- `AIAssistant` - AI suggestion panel with copy-to-clipboard

**Form Components:**
- `LoginModal` - Login form with OAuth buttons
- `SignupModal` - Registration form with consent checkboxes
- `ProfileForm` - User profile editor
- `ProjectForm` - Project creation/edit form
- `InviteUserForm` - Team member invitation form

**Shared Components:**
- `Button` - Styled button with variants
- `Input` - Form input with validation display
- `Select` - Dropdown select component
- `Textarea` - Multi-line text input
- `Checkbox` - Checkbox with label
- `Avatar` - User avatar with fallback initials
- `Badge` - Status/priority badges
- `Tooltip` - Hover tooltips
- `Spinner` - Loading indicator
- `ThemeToggle` - Light/dark mode switcher


### Backend API Endpoints

**Authentication:**
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Invalidate session
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Verify email with token
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Handle OAuth callback

**Users:**
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update user profile
- `PATCH /api/users/me/password` - Change password
- `POST /api/users/me/avatar` - Upload profile picture

**Tenants:**
- `GET /api/tenants/me` - Get current tenant info
- `PATCH /api/tenants/me` - Update tenant settings
- `POST /api/tenants/me/invite` - Invite team member
- `DELETE /api/tenants/members/:userId` - Remove team member
- `PATCH /api/tenants/members/:userId/role` - Update member role

**Projects:**
- `GET /api/projects` - List all projects for tenant
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**Milestones:**
- `GET /api/projects/:projectId/milestones` - List milestones
- `POST /api/projects/:projectId/milestones` - Create milestone
- `PATCH /api/milestones/:id` - Update milestone
- `DELETE /api/milestones/:id` - Delete milestone
- `POST /api/milestones/:id/lock` - Lock milestone as version

**Tasks:**
- `GET /api/projects/:projectId/tasks` - List tasks
- `POST /api/projects/:projectId/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/assign` - Assign users to task
- `POST /api/tasks/:id/comments` - Add comment


**Bugs:**
- `GET /api/projects/:projectId/bugs` - List bugs
- `POST /api/projects/:projectId/bugs` - Create bug
- `PATCH /api/bugs/:id` - Update bug
- `DELETE /api/bugs/:id` - Delete bug
- `POST /api/bugs/:id/vote` - Vote on bug (public if enabled)
- `POST /api/bugs/:id/comments` - Add comment
- `POST /api/bugs/:id/image` - Upload bug screenshot

**Feature Requests:**
- `GET /api/projects/:projectId/features` - List feature requests
- `POST /api/projects/:projectId/features` - Create feature request
- `PATCH /api/features/:id` - Update feature request
- `DELETE /api/features/:id` - Delete feature request
- `POST /api/features/:id/vote` - Vote on feature (public if enabled)
- `POST /api/features/:id/comments` - Add comment

**Channels:**
- `GET /api/projects/:projectId/channels` - List channels
- `POST /api/projects/:projectId/channels` - Create channel
- `PATCH /api/channels/:id` - Update channel permissions
- `DELETE /api/channels/:id` - Delete channel
- `GET /api/channels/:id/messages` - Get message history
- `POST /api/channels/:id/messages` - Send message (also via WebSocket)

**Notes:**
- `GET /api/notes` - List user's notes
- `POST /api/notes` - Create note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

**Environment Variables:**
- `GET /api/projects/:projectId/env-vars` - List env vars (role-restricted)
- `POST /api/projects/:projectId/env-vars` - Create env var
- `PATCH /api/env-vars/:id` - Update env var
- `DELETE /api/env-vars/:id` - Delete env var

**AI Assistant:**
- `POST /api/ai/analyze-bug` - Get AI suggestions for bug fix
- `POST /api/ai/generate-feature-spec` - Generate feature specification
- `POST /api/ai/generate-prompt` - Generate AI agent prompt

**Notifications:**
- `GET /api/notifications` - List user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all as read


### WebSocket Events

**Connection:**
- `connection` - Client connects, authenticate via JWT
- `disconnect` - Client disconnects, cleanup rooms

**Real-time Updates:**
- `task:created` - New task added
- `task:updated` - Task modified
- `task:deleted` - Task removed
- `bug:created` - New bug reported
- `bug:updated` - Bug modified
- `feature:created` - New feature request
- `feature:updated` - Feature request modified
- `message:new` - New chat message
- `notification:new` - New notification
- `milestone:updated` - Milestone changed

**Room Management:**
- `join:project` - Subscribe to project updates
- `leave:project` - Unsubscribe from project
- `join:channel` - Subscribe to channel messages
- `leave:channel` - Unsubscribe from channel

## Data Models

### Core Entities

**User**
```typescript
interface User {
  id: string;
  email: string;
  passwordHash?: string; // null for OAuth users
  name: string;
  avatarUrl?: string;
  authProvider: 'email' | 'google';
  emailVerified: boolean;
  emailOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Tenant**
```typescript
interface Tenant {
  id: string;
  name: string;
  ownerId: string; // User who pays for subscription
  subscriptionTier: 'free' | 'paid';
  maxProjects: number;
  maxTeamMembers: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**TenantMember**
```typescript
interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  role: 'owner' | 'admin' | 'developer' | 'auditor';
  createdAt: Date;
}
```


**Project**
```typescript
interface Project {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  publicBugTracking: boolean;
  publicFeatureRequests: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Milestone**
```typescript
interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  estimatedCompletionDate: Date;
  actualCompletionDate?: Date;
  status: 'planned' | 'in-progress' | 'completed';
  isLocked: boolean; // Version lock
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Task**
```typescript
interface Task {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  category?: string;
  priority: number;
  status: 'todo' | 'in-progress' | 'done';
  ownerId?: string; // User who owns the task
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**TaskAssignment**
```typescript
interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  assignedAt: Date;
}
```

**Bug**
```typescript
interface Bug {
  id: string;
  projectId: string;
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  priority: number;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  votes: number;
  ownerId?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```


**BugAssignment**
```typescript
interface BugAssignment {
  id: string;
  bugId: string;
  userId: string;
  assignedAt: Date;
}
```

**BugVote**
```typescript
interface BugVote {
  id: string;
  bugId: string;
  userId?: string; // null for anonymous public votes
  ipAddress: string; // For rate limiting public votes
  createdAt: Date;
}
```

**FeatureRequest**
```typescript
interface FeatureRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  votes: number;
  priority: number;
  status: 'proposed' | 'planned' | 'in-progress' | 'completed' | 'rejected';
  ownerId?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**FeatureAssignment**
```typescript
interface FeatureAssignment {
  id: string;
  featureRequestId: string;
  userId: string;
  assignedAt: Date;
}
```

**FeatureVote**
```typescript
interface FeatureVote {
  id: string;
  featureRequestId: string;
  userId?: string;
  ipAddress: string;
  createdAt: Date;
}
```

**Comment**
```typescript
interface Comment {
  id: string;
  resourceType: 'task' | 'bug' | 'feature' | 'milestone';
  resourceId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```


**Channel**
```typescript
interface Channel {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**ChannelPermission**
```typescript
interface ChannelPermission {
  id: string;
  channelId: string;
  userId: string;
  canView: boolean;
  canPost: boolean;
  grantedAt: Date;
}
```

**Message**
```typescript
interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Note**
```typescript
interface Note {
  id: string;
  userId: string;
  content: string;
  color?: string; // For post-it styling
  position?: { x: number; y: number }; // For positioning
  createdAt: Date;
  updatedAt: Date;
}
```

**EnvVar**
```typescript
interface EnvVar {
  id: string;
  projectId: string;
  key: string;
  value: string; // Encrypted at rest
  environment: 'development' | 'production';
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Notification**
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'bug_created' | 'feature_created' | 'task_assigned' | 'mention' | 'system';
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: Date;
}
```


**ChangeOrder**
```typescript
interface ChangeOrder {
  id: string;
  projectId: string;
  milestoneId: string; // The locked milestone this is outside of
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**AIConfig**
```typescript
interface AIConfig {
  id: string;
  tenantId: string;
  provider: 'openai' | 'google' | 'platform';
  apiKey?: string; // Encrypted, null if using platform keys
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Relationships

```
Tenant (1) ──< (N) TenantMember >── (1) User
Tenant (1) ──< (N) Project
Project (1) ──< (N) Milestone
Project (1) ──< (N) Task
Project (1) ──< (N) Bug
Project (1) ──< (N) FeatureRequest
Project (1) ──< (N) Channel
Project (1) ──< (N) EnvVar
Milestone (1) ──< (N) Task
Milestone (1) ──< (N) ChangeOrder
Task (1) ──< (N) TaskAssignment >── (1) User
Bug (1) ──< (N) BugAssignment >── (1) User
Bug (1) ──< (N) BugVote
FeatureRequest (1) ──< (N) FeatureAssignment >── (1) User
FeatureRequest (1) ──< (N) FeatureVote
Channel (1) ──< (N) ChannelPermission >── (1) User
Channel (1) ──< (N) Message >── (1) User
User (1) ──< (N) Note
User (1) ──< (N) Notification
User (1) ──< (N) Comment
Tenant (1) ──< (1) AIConfig
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication and Authorization Properties

**Property 1: Session token validity**
*For any* authenticated user session, the JWT token should contain valid userId, tenantId, and role claims that match the database records.
**Validates: Requirements 5.7**

**Property 2: Password hashing irreversibility**
*For any* user password, storing and retrieving the password hash should never reveal the original password.
**Validates: Requirements 19.3**

**Property 3: Role-based access enforcement**
*For any* API request requiring specific permissions, users without the required role should receive a 403 Forbidden response.
**Validates: Requirements 26.6**

**Property 4: Email verification requirement**
*For any* email-based signup, the user account should remain inactive until email verification is completed.
**Validates: Requirements 5.5**

### Tenant Isolation Properties

**Property 5: Tenant data isolation**
*For any* database query for tenant-specific resources, the results should only include data belonging to the authenticated user's tenant.
**Validates: Requirements 23.3**

**Property 6: Cross-tenant access prevention**
*For any* attempt to access resources from a different tenant, the system should deny access regardless of authentication status.
**Validates: Requirements 23.3**


### Subscription and Limits Properties

**Property 7: Project limit enforcement**
*For any* tenant, attempting to create a project beyond the subscription's maxProjects limit should be rejected.
**Validates: Requirements 7.2**

**Property 8: Team member limit enforcement**
*For any* tenant, attempting to add team members beyond the subscription's maxTeamMembers limit should be rejected.
**Validates: Requirements 7.6**

**Property 9: Free tier feature restrictions**
*For any* free tier tenant, attempting to access paid features (team communication, milestones) should be denied.
**Validates: Requirements 7.1, 8.1**

### Task Management Properties

**Property 10: Task-milestone association**
*For any* task linked to a milestone, the task's projectId should match the milestone's projectId.
**Validates: Requirements 10.2**

**Property 11: Task assignment validity**
*For any* task assignment, all assigned users should be members of the task's project tenant.
**Validates: Requirements 10.3**

**Property 12: Unassigned task display**
*For any* task with no assignments, the display should show "not assigned" status.
**Validates: Requirements 10.5**

### Bug and Feature Tracking Properties

**Property 13: Public voting access control**
*For any* bug or feature request with public access disabled, voting attempts from unauthenticated users should be rejected.
**Validates: Requirements 11.6, 12.4**

**Property 14: Vote count consistency**
*For any* bug or feature request, the votes field should equal the count of associated vote records.
**Validates: Requirements 11.5, 12.3**

**Property 15: Image optimization on upload**
*For any* uploaded image, the stored file size should be less than or equal to the original upload size.
**Validates: Requirements 11.9, 17.4**


**Property 16: Admin notification on new bugs**
*For any* newly created bug, all users with admin or owner roles in the project should receive a notification.
**Validates: Requirements 11.10**

**Property 17: Admin notification on new feature requests**
*For any* newly created feature request, all users with admin or owner roles in the project should receive a notification.
**Validates: Requirements 12.7**

### Milestone and Version Lock Properties

**Property 18: Locked milestone immutability**
*For any* milestone with isLocked=true, attempts to modify the milestone should be rejected.
**Validates: Requirements 9.4**

**Property 19: Change order association**
*For any* change order, the associated milestone should have isLocked=true.
**Validates: Requirements 9.5**

### Real-time Update Properties

**Property 20: Dashboard auto-update on task creation**
*For any* new task created by any team member, all connected users viewing the same project should receive a real-time update.
**Validates: Requirements 20.1**

**Property 21: Message delivery to authorized users**
*For any* message posted in a channel, all users with view permissions for that channel should receive the message in real-time.
**Validates: Requirements 20.3**

**Property 22: Notification indicator on new items**
*For any* newly created task, bug, or feature request, the dashboard should display a "new" indicator until the user views it.
**Validates: Requirements 20.4**


### Channel Permission Properties

**Property 23: Channel view permission enforcement**
*For any* channel access attempt, users should only see channels where they have canView=true permission.
**Validates: Requirements 13.2**

**Property 24: Channel post permission enforcement**
*For any* message post attempt, the system should only allow posting if the user has canPost=true permission for that channel.
**Validates: Requirements 13.3**

### Input Validation and Security Properties

**Property 25: SQL injection prevention**
*For any* user input used in database queries, the parameterized query should prevent SQL injection attacks.
**Validates: Requirements 19.4**

**Property 26: XSS prevention**
*For any* user-generated content displayed in the UI, special characters should be escaped to prevent XSS attacks.
**Validates: Requirements 19.4**

**Property 27: Demo content moderation**
*For any* content submitted in the demo environment, profanity and hate speech should be blocked before storage.
**Validates: Requirements 22.2**

### Media Storage Properties

**Property 28: Storage location consistency**
*For any* media upload, when MEDIA_STORAGE_LOCAL="local", files should be stored on the local filesystem, and when "remote", files should be stored in cloud storage.
**Validates: Requirements 17.1, 17.2**

**Property 29: Profile picture size requirement**
*For any* Google OAuth user import, the profile picture should be at least 600x600 pixels.
**Validates: Requirements 5.6**


### Email and Communication Properties

**Property 30: Email opt-in enforcement**
*For any* marketing email sent, the recipient should have emailOptIn=true in their user record.
**Validates: Requirements 21.2**

**Property 31: Email verification token expiration**
*For any* email verification attempt, expired tokens should be rejected and require a new verification email.
**Validates: Requirements 5.4**

### Demo Environment Properties

**Property 32: Demo database reset**
*For any* 24-hour period, the demo database should be restored to its seeded state exactly once.
**Validates: Requirements 3.4**

**Property 33: Demo registration requirement**
*For any* demo access attempt, unauthenticated visitors should be required to register with email opt-in.
**Validates: Requirements 3.1**

### Theme and UI Properties

**Property 34: Theme persistence**
*For any* user theme selection, the preference should persist across sessions and page reloads.
**Validates: Requirements 18.3**

**Property 35: Default dark mode**
*For any* first-time visitor, the system should display dark mode by default.
**Validates: Requirements 18.1**


## Error Handling

### API Error Responses

All API errors follow a consistent format:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  statusCode: number;
}
```

**Error Categories:**

1. **Authentication Errors (401)**
   - `AUTH_TOKEN_MISSING` - No authentication token provided
   - `AUTH_TOKEN_INVALID` - Token signature invalid or malformed
   - `AUTH_TOKEN_EXPIRED` - Token has expired
   - `AUTH_EMAIL_NOT_VERIFIED` - Email verification required

2. **Authorization Errors (403)**
   - `FORBIDDEN_INSUFFICIENT_PERMISSIONS` - User lacks required role
   - `FORBIDDEN_TENANT_MISMATCH` - Resource belongs to different tenant
   - `FORBIDDEN_SUBSCRIPTION_REQUIRED` - Feature requires paid subscription

3. **Validation Errors (400)**
   - `VALIDATION_FAILED` - Input validation failed (includes field details)
   - `INVALID_FILE_TYPE` - Uploaded file type not allowed
   - `FILE_TOO_LARGE` - File exceeds size limit
   - `PROFANITY_DETECTED` - Content contains inappropriate language

4. **Resource Errors (404)**
   - `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
   - `PROJECT_NOT_FOUND` - Project ID invalid
   - `USER_NOT_FOUND` - User ID invalid

5. **Conflict Errors (409)**
   - `EMAIL_ALREADY_EXISTS` - Email already registered
   - `LIMIT_EXCEEDED_PROJECTS` - Project limit reached
   - `LIMIT_EXCEEDED_TEAM_MEMBERS` - Team member limit reached
   - `MILESTONE_LOCKED` - Cannot modify locked milestone

6. **Server Errors (500)**
   - `INTERNAL_SERVER_ERROR` - Unexpected server error
   - `DATABASE_ERROR` - Database operation failed
   - `EXTERNAL_SERVICE_ERROR` - Third-party service failed (AI, OAuth, storage)


### Frontend Error Handling

**Error Boundary Strategy:**
- Root error boundary catches all unhandled React errors
- Feature-specific error boundaries for isolated failure recovery
- Toast notifications for user-facing errors
- Console logging for development debugging
- Error reporting service integration (optional)

**Network Error Handling:**
- Automatic retry with exponential backoff for transient failures
- Offline detection and user notification
- Request queuing for offline-first features
- Timeout handling (30s for API requests, 5s for WebSocket)

**Form Validation:**
- Client-side validation with Zod schemas (same as backend)
- Real-time field validation on blur
- Form-level validation on submit
- Clear error messages with field highlighting

### WebSocket Error Handling

**Connection Errors:**
- Automatic reconnection with exponential backoff (max 30s)
- Connection state indicator in UI
- Graceful degradation to polling if WebSocket unavailable
- Queue messages during disconnection, send on reconnect

**Message Errors:**
- Acknowledgment system for critical messages
- Retry failed message sends (max 3 attempts)
- User notification for permanent failures

## Testing Strategy

### Unit Testing

**Backend Unit Tests:**
- Service layer functions (business logic)
- Utility functions (validation, formatting, encryption)
- Middleware (authentication, authorization, error handling)
- Database models and queries (using test database)
- Target: 80%+ code coverage for critical paths

**Frontend Unit Tests:**
- React components (isolated with mocked dependencies)
- Custom hooks
- Utility functions
- Form validation logic
- Target: 70%+ code coverage

**Tools:** Vitest, React Testing Library


### Integration Testing

**API Integration Tests:**
- Full request/response cycle testing
- Authentication flow testing
- Multi-step workflows (signup → verify → login)
- Database state verification
- Error response validation

**WebSocket Integration Tests:**
- Connection establishment and authentication
- Message broadcasting to multiple clients
- Room subscription and unsubscription
- Reconnection behavior

**Tools:** Supertest, Socket.io-client

### Property-Based Testing

**Property-Based Testing Library:** fast-check (JavaScript/TypeScript)

**Configuration:**
- Minimum 100 iterations per property test
- Configurable seed for reproducible failures
- Shrinking enabled for minimal failing examples

**Property Test Tagging:**
Each property-based test must include a comment with this exact format:
```typescript
// **Feature: worklamp-platform, Property {number}: {property_text}**
```

Example:
```typescript
// **Feature: worklamp-platform, Property 5: Tenant data isolation**
test('tenant data isolation', () => {
  fc.assert(
    fc.property(
      fc.record({ tenantId: fc.uuid(), userId: fc.uuid() }),
      async (context) => {
        // Test that queries only return data for the user's tenant
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test Coverage:**
- Each correctness property from the design document must be implemented as a single property-based test
- Properties should be tested as close to implementation as possible to catch errors early
- Focus on universal properties that should hold across all inputs
- Use smart generators that constrain to valid input spaces


### End-to-End Testing

**E2E Test Scenarios:**
- Complete user journeys (signup → create project → add task → complete task)
- Multi-user collaboration scenarios
- Real-time update verification
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Mobile responsive behavior
- Authentication flows (email and OAuth)

**Tools:** Playwright

### Performance Testing

**Load Testing:**
- Concurrent user simulation (target: 100 concurrent users)
- WebSocket connection stress testing
- Database query performance under load
- API response time monitoring (target: <200ms p95)

**Tools:** Artillery, k6

### Security Testing

**Security Audit Checklist:**
- SQL injection testing (automated with sqlmap)
- XSS vulnerability scanning
- CSRF protection verification
- Authentication bypass attempts
- Authorization boundary testing
- Dependency vulnerability scanning (npm audit, Snyk)
- Secrets scanning (no hardcoded credentials)

**Penetration Testing:**
- Manual security review before production launch
- Third-party security audit (recommended for production)

### Test Documentation

All feature tests must include documentation in `/DOCS/testing/` with:
- Feature overview
- Test scenarios covered
- Manual testing steps for user acceptance
- Expected results
- Known limitations or edge cases


## Implementation Approach

### Development Phases

**Phase 1: Foundation (Weeks 1-2)**
- Project setup and configuration
- Database schema and migrations
- Authentication system (email and OAuth)
- Basic API structure
- Frontend shell with routing

**Phase 2: Core Features (Weeks 3-5)**
- Tenant and subscription management
- Project CRUD operations
- Task management
- Dashboard layout
- Real-time infrastructure (WebSocket)

**Phase 3: Collaboration Features (Weeks 6-8)**
- Bug tracking
- Feature request system
- Team communication (channels and messages)
- Notifications system
- Comments system

**Phase 4: Advanced Features (Weeks 9-10)**
- Milestone management and timeline
- Version locking and change orders
- Environment variable tracking
- User notes
- AI assistant integration

**Phase 5: Marketing and Demo (Weeks 11-12)**
- Marketing site pages
- Demo environment with seeding
- Content moderation
- Email templates and newsletter

**Phase 6: Polish and Launch (Weeks 13-14)**
- Performance optimization
- Security hardening
- Comprehensive testing
- Documentation
- Deployment setup

### Build Order for Each Feature

For each feature, follow this sequence:
1. **API Layer**: Implement backend endpoints with validation
2. **Database**: Create/update schema and migrations
3. **Service Layer**: Implement business logic
4. **Frontend Components**: Build UI components
5. **Integration**: Wire frontend to backend
6. **Tests**: Write unit and property-based tests
7. **Documentation**: Document testing procedures in /DOCS

### Environment Configuration

**Required Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/worklamp
DATABASE_URL_DEMO=postgresql://user:password@localhost:5432/worklamp_demo

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=<random-256-bit-secret>
JWT_REFRESH_SECRET=<random-256-bit-secret>
SESSION_SECRET=<random-256-bit-secret>

# Google OAuth
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Admin
ADMIN_EMAIL=admin@worklamp.com

# Email
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=<smtp-username>
SMTP_PASSWORD=<smtp-password>
SMTP_FROM=noreply@worklamp.com

# Media Storage
MEDIA_STORAGE_LOCAL=local
AWS_ACCESS_KEY_ID=<optional-for-remote-storage>
AWS_SECRET_ACCESS_KEY=<optional-for-remote-storage>
AWS_REGION=us-east-1
AWS_S3_BUCKET=worklamp-media

# AI (Optional)
PLATFORM_OPENAI_API_KEY=<optional-platform-key>
PLATFORM_GOOGLE_AI_API_KEY=<optional-platform-key>

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000
```


### Project Structure

```
worklamp/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   │   ├── (marketing)/    # Marketing site routes
│   │   ├── (auth)/         # Auth pages
│   │   ├── (app)/          # Main application routes
│   │   └── api/            # API routes (if using Next.js API)
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components
│   │   ├── features/      # Feature-specific components
│   │   └── layouts/       # Layout components
│   ├── lib/               # Utilities and helpers
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand stores
│   ├── styles/            # Global styles
│   └── public/            # Static assets
│
├── backend/                 # Express API server
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API route definitions
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models (if not using Prisma)
│   │   ├── utils/         # Utility functions
│   │   ├── validators/    # Input validation schemas
│   │   ├── jobs/          # Background job definitions
│   │   └── websocket/     # Socket.io handlers
│   ├── prisma/            # Prisma schema and migrations
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── tests/             # Backend tests
│
├── shared/                  # Shared code between frontend/backend
│   ├── types/             # TypeScript type definitions
│   ├── constants/         # Shared constants
│   └── validators/        # Shared validation schemas
│
├── DOCS/                    # Documentation
│   ├── testing/           # Test documentation
│   ├── api/               # API documentation
│   └── deployment/        # Deployment guides
│
├── docker/                  # Docker configuration
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
└── scripts/                 # Utility scripts
    ├── seed-demo.ts       # Demo data seeding
    └── reset-demo.ts      # Demo reset job
```


### Security Considerations

**Authentication Security:**
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens signed with HS256 algorithm
- Tokens stored in httpOnly, secure, sameSite=strict cookies
- Refresh token rotation on use
- Session invalidation on logout
- Rate limiting on auth endpoints (5 attempts per 15 minutes)

**Authorization Security:**
- Role-based access control enforced at API layer
- Tenant isolation enforced in database queries
- Resource ownership verification before modifications
- Admin actions logged with audit trail

**Data Security:**
- Environment variables encrypted at rest (using crypto.encrypt)
- Sensitive data never logged
- Database connections over SSL in production
- API keys stored encrypted with separate encryption key

**Network Security:**
- HTTPS required in production
- CORS configured for specific origins
- Helmet.js security headers
- Rate limiting on all API endpoints
- DDoS protection via reverse proxy (nginx)

**Input Security:**
- All inputs validated with Zod schemas
- SQL injection prevented by Prisma ORM
- XSS prevented by React escaping + DOMPurify
- File uploads validated by type, size, and magic bytes
- Content Security Policy headers

**Dependency Security:**
- Regular npm audit runs
- Automated dependency updates (Dependabot)
- Only use actively maintained packages
- Pin exact versions in production

### Performance Optimizations

**Frontend:**
- Next.js static generation for marketing pages
- React Query caching with stale-while-revalidate
- Image optimization with next/image
- Code splitting by route
- Lazy loading for heavy components
- Virtual scrolling for long lists
- Debounced search inputs

**Backend:**
- Database query optimization with indexes
- Redis caching for frequently accessed data
- Connection pooling for database
- Pagination for list endpoints
- Compression middleware (gzip)
- CDN for static assets (optional)

**Real-time:**
- Redis pub/sub for horizontal scaling
- Room-based message broadcasting
- Heartbeat mechanism for connection health
- Message batching for high-frequency updates

