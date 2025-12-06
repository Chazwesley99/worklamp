# Admin System Implementation

## Overview

A comprehensive admin system has been implemented to allow platform administrators to manage users, view statistics, and modify user subscriptions.

## Features

### Backend

#### Database Schema

- Added `isAdmin` boolean field to the User model (defaults to false)
- Migration created: `20251206164319_add_user_is_admin`

#### Admin Routes (`/api/admin/*`)

All routes require authentication and admin privileges:

- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users (with pagination and search)
- `GET /api/admin/users/:id` - Get user by ID
- `PATCH /api/admin/users/:id` - Update user
- `PATCH /api/admin/users/:userId/tenant/:tenantId` - Update user's tenant
- `DELETE /api/admin/users/:id` - Delete user

#### Admin Middleware

- `requireAdmin` - Verifies user has admin privileges
- Checks `isAdmin` flag in JWT token payload

#### Admin Service

Provides methods for:

- Getting all users with pagination and search
- Getting user details with tenant information
- Updating user data (name, email, emailVerified, isAdmin)
- Updating tenant subscription (tier, maxProjects, maxTeamMembers)
- Deleting users
- Getting platform statistics

#### JWT Token Updates

- Added `isAdmin` field to TokenPayload interface
- Token generation now includes isAdmin flag from user record
- Auth service updated to include isAdmin in login and refresh flows

#### Seed Script

- Updated to set admin user from `ADMIN_EMAIL` environment variable
- Admin user automatically gets `isAdmin: true` flag
- Seed script can be run with: `npm run prisma:seed` (in backend directory)

### Frontend

#### Admin Page (`/app/admin`)

Features:

- Platform statistics dashboard (users, tenants, projects, tasks, bugs, features)
- User management table with:
  - User information (name, email, avatar)
  - Status badges (verified, admin)
  - Subscription tier
  - Project and member limits
  - Edit and delete actions
- Search functionality
- Pagination
- Edit user modal with:
  - User details (name, email)
  - Email verification toggle
  - Admin role toggle
  - Tenant settings (subscription tier, max projects, max members)

#### Sidebar Updates

- Admin link shown only for users with `isAdmin: true`
- Purple gear icon for admin section
- Located in footer section above Team Settings

#### API Client

- New `adminApi` module in `frontend/lib/api/admin.ts`
- Type-safe methods for all admin operations
- Proper error handling

#### Auth Context

- Updated User interface to include `isAdmin` field
- Admin status available throughout the application

## Environment Variables

### Backend (.env)

```env
ADMIN_EMAIL=admin@worklamp.com
```

The user with this email will automatically be granted admin privileges when the seed script runs.

## Usage

### Setting Up an Admin User

1. Set the `ADMIN_EMAIL` in your backend `.env` file
2. Run the seed script:
   ```bash
   cd backend
   npm run prisma:seed
   ```

### Manually Setting Admin in Database

If you need to manually grant admin privileges:

```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

### Accessing the Admin Panel

1. Log in with an admin account
2. Click the "Admin" link in the sidebar (purple gear icon)
3. View statistics and manage users

### Managing Users

From the admin panel, you can:

- Search for users by name or email
- View user details and subscription information
- Edit user information:
  - Change name and email
  - Toggle email verification
  - Grant/revoke admin privileges
  - Modify subscription tier (free/paid)
  - Adjust project and team member limits
- Delete users (with confirmation)

## Security

- All admin routes are protected by authentication middleware
- Admin middleware verifies `isAdmin` flag in JWT token
- Frontend admin page redirects non-admin users to dashboard
- Admin link only visible to admin users in sidebar

## Files Modified/Created

### Backend

- `backend/prisma/schema.prisma` - Added isAdmin field
- `backend/prisma/seed.ts` - Updated to set admin user
- `backend/package.json` - Added prisma seed configuration
- `backend/src/utils/jwt.ts` - Added isAdmin to TokenPayload
- `backend/src/services/auth.service.ts` - Include isAdmin in tokens
- `backend/src/services/user.service.ts` - Include isAdmin in user queries
- `backend/src/controllers/admin.controller.ts` - New admin controller
- `backend/src/services/admin.service.ts` - New admin service
- `backend/src/routes/admin.routes.ts` - New admin routes
- `backend/src/middleware/admin.middleware.ts` - New admin middleware
- `backend/src/validators/admin.validator.ts` - New admin validators
- `backend/src/index.ts` - Registered admin routes

### Frontend

- `frontend/lib/api/auth.ts` - Added isAdmin to User interface
- `frontend/lib/api/admin.ts` - New admin API client
- `frontend/app/admin/page.tsx` - New admin page
- `frontend/components/layout/Sidebar.tsx` - Added admin link

## Testing

To test the admin system:

1. Ensure backend and frontend are running
2. Log in with the admin user (email from ADMIN_EMAIL)
3. Navigate to `/admin`
4. Verify you can:
   - See platform statistics
   - Search and view users
   - Edit user details
   - Modify subscription settings
   - Delete users (test with a non-admin account)

## Future Enhancements

Potential additions to the admin system:

- Audit logs for admin actions
- Bulk user operations
- Advanced filtering and sorting
- User activity monitoring
- Tenant management (create, delete, transfer ownership)
- System configuration settings
- Email templates management
- Platform-wide announcements
