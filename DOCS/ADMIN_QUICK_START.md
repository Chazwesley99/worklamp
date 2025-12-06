# Admin System Quick Start Guide

## Setup

### 1. Set Admin Email

In your `backend/.env` file, set the admin email:

```env
ADMIN_EMAIL=your-email@example.com
```

### 2. Run Database Migration

The migration has already been applied, but if you need to run it again:

```bash
cd backend
npx prisma migrate dev
```

### 3. Seed the Database

This will create/update the admin user with admin privileges:

```bash
cd backend
npm run prisma:seed
```

## Accessing the Admin Panel

1. **Start the application**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Log in with admin account**
   - Go to http://localhost:3000
   - Log in with the email you set in `ADMIN_EMAIL`
   - Password: `admin123` (if using the seeded admin user)

3. **Access admin panel**
   - Look for the purple "Admin" link in the sidebar (gear icon)
   - Click to access the admin dashboard

## Admin Features

### Platform Statistics

View at-a-glance statistics:

- Total users, verified users, admin users
- Total tenants
- Total projects, tasks, bugs, and features

### User Management

#### Search Users

- Use the search bar to find users by email or name
- Results update automatically as you type

#### View User Details

Each user row shows:

- Name and avatar
- Email address
- Verification status
- Admin status
- Subscription tier (free/paid)
- Project and member limits

#### Edit User

Click "Edit" on any user to:

1. **Update User Information**
   - Change name
   - Change email
   - Toggle email verification
   - Grant/revoke admin privileges

2. **Modify Subscription**
   - Change subscription tier (free/paid)
   - Adjust max projects (1-999)
   - Adjust max team members (1-999)

3. **Save Changes**
   - Click "Save Changes" to apply
   - Changes take effect immediately

#### Delete User

- Click "Delete" on any user
- Confirm the deletion
- User and all associated data will be removed

## Common Tasks

### Make a User an Admin

1. Go to Admin panel
2. Find the user (use search if needed)
3. Click "Edit"
4. Check the "Admin User" checkbox
5. Click "Save Changes"

### Upgrade User to Paid Plan

1. Go to Admin panel
2. Find the user
3. Click "Edit"
4. In "Tenant Settings" section:
   - Change "Subscription Tier" to "Paid"
   - Increase "Max Projects" (e.g., 10)
   - Increase "Max Team Members" (e.g., 10)
5. Click "Save Changes"

### Verify User Email Manually

1. Go to Admin panel
2. Find the user
3. Click "Edit"
4. Check "Email Verified"
5. Click "Save Changes"

## Security Notes

- Only users with `isAdmin: true` can access the admin panel
- Non-admin users are automatically redirected to dashboard
- Admin link only appears in sidebar for admin users
- All admin actions are protected by authentication middleware

## Troubleshooting

### Can't see Admin link

- Verify you're logged in with an admin account
- Check database: `SELECT email, "isAdmin" FROM "User" WHERE email = 'your-email@example.com';`
- If `isAdmin` is false, run the seed script or update manually

### Admin panel shows "Access Denied"

- Your JWT token may not include the `isAdmin` flag
- Log out and log back in to get a new token with admin privileges

### Changes not saving

- Check browser console for errors
- Verify backend is running
- Check backend logs for error messages

## Manual Database Updates

If you need to manually grant admin privileges:

```sql
-- Grant admin privileges
UPDATE "User" SET "isAdmin" = true WHERE email = 'user@example.com';

-- Revoke admin privileges
UPDATE "User" SET "isAdmin" = false WHERE email = 'user@example.com';

-- Update subscription
UPDATE "Tenant"
SET "subscriptionTier" = 'paid',
    "maxProjects" = 10,
    "maxTeamMembers" = 10
WHERE "ownerId" = (SELECT id FROM "User" WHERE email = 'user@example.com');
```

## API Endpoints

For programmatic access:

```bash
# Get all users
GET /api/admin/users?page=1&limit=50&search=john

# Get user by ID
GET /api/admin/users/:userId

# Update user
PATCH /api/admin/users/:userId
{
  "name": "New Name",
  "email": "new@email.com",
  "emailVerified": true,
  "isAdmin": true
}

# Update user's tenant
PATCH /api/admin/users/:userId/tenant/:tenantId
{
  "subscriptionTier": "paid",
  "maxProjects": 10,
  "maxTeamMembers": 10
}

# Delete user
DELETE /api/admin/users/:userId

# Get platform stats
GET /api/admin/stats
```

All endpoints require:

- Authentication (Bearer token)
- Admin privileges (`isAdmin: true`)
