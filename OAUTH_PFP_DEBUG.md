# OAuth Profile Picture Debug Guide

## Problem

New Google OAuth users are not seeing their profile pictures (PFP) in the user menu after login, even though the avatar URL should be saved from Google.

## Investigation Added

I've added comprehensive debug logging throughout the entire OAuth flow to trace exactly where the avatar data is being lost or not properly loaded.

### Debug Logs Added

#### Backend - Google OAuth Strategy (`backend/src/config/passport.ts`)

1. **Line ~25**: Logs Google profile data received including avatarUrl
2. **Line ~70**: Logs when creating new user with avatarUrl
3. **Line ~72**: Logs the created user's avatarUrl
4. **Line ~105**: Logs reloaded user's avatarUrl after tenant creation

#### Backend - User Service (`backend/src/services/user.service.ts`)

1. **Line ~35**: Logs getUserById result including avatarUrl

#### Backend - User Controller (`backend/src/controllers/user.controller.ts`)

1. **Line ~35**: Logs user data being returned to client via HTTP response

#### Frontend - Auth API (`frontend/lib/api/auth.ts`)

1. **Line ~50**: Logs getCurrentUser API response including avatarUrl

#### Frontend - Auth Context (`frontend/lib/contexts/AuthContext.tsx`)

1. **Line ~30**: Logs user data loaded from API including avatarUrl

#### Frontend - OAuth Callback (`frontend/app/auth/callback/page.tsx`)

1. **Line ~27**: Logs when token is received and user refresh starts
2. **Line ~32**: Logs when user refresh completes

#### Frontend - User Menu (`frontend/components/layout/DashboardLayout.tsx`)

1. **Line ~110**: Logs user data received by the UserMenu component

## Testing Steps

### 1. Start Backend with Logs Visible

```bash
cd backend
npm run dev
```

Keep this terminal visible to see backend logs.

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Test with New Google Account

1. Open browser DevTools Console (F12)
2. Navigate to http://localhost:3000
3. Click "Sign in with Google"
4. Use a NEW Google account (one that hasn't logged in before)
5. Complete OAuth flow

### 4. Check Logs

#### Expected Backend Log Sequence:

```
[OAUTH DEBUG] Google profile data: { email: '...', name: '...', avatarUrl: 'https://...', hasPhoto: true }
[OAUTH DEBUG] Creating new user with avatarUrl: https://...
[OAUTH DEBUG] User created with avatarUrl: https://...
[OAUTH DEBUG] Reloaded user avatarUrl: https://...
[USER SERVICE DEBUG] getUserById result: { userId: '...', avatarUrl: 'https://...', hasAvatar: true }
[USER CONTROLLER DEBUG] Returning user to client: { userId: '...', email: '...', avatarUrl: 'https://...', hasAvatar: true }
```

#### Expected Frontend Log Sequence:

```
[OAUTH CALLBACK DEBUG] Received token, storing and refreshing user
[AUTH API DEBUG] getCurrentUser response: { id: '...', email: '...', avatarUrl: 'https://...', hasAvatar: true }
[AUTH CONTEXT DEBUG] User loaded: { id: '...', email: '...', avatarUrl: 'https://...', hasAvatar: true }
[OAUTH CALLBACK DEBUG] User refreshed, redirecting to dashboard
[USER MENU DEBUG] User data: { id: '...', email: '...', avatarUrl: 'https://...', hasAvatar: true }
```

## What to Look For

### Scenario 1: Avatar NOT in Google Profile

If backend logs show `hasPhoto: false`, Google didn't provide a photo URL. This is rare but possible.

### Scenario 2: Avatar Lost in Database

If backend shows avatar during creation but NOT during getUserById, there's a database issue.

### Scenario 3: Avatar Not Reaching Frontend

If backend getUserById shows avatar but frontend doesn't receive it, there's an API/serialization issue.

### Scenario 4: Avatar Received but Not Displayed

If frontend logs show avatar but UI doesn't display it, there's a rendering issue in DashboardLayout.

## Quick Database Check

To verify avatar is actually saved in database:

```bash
cd backend
npx prisma studio
```

Then:

1. Open "User" table
2. Find the user by email
3. Check if `avatarUrl` field has a value

## Next Steps Based on Findings

After testing, share:

1. All backend console logs from OAuth flow
2. All frontend console logs from OAuth flow
3. Screenshot of Prisma Studio showing the user record
4. Screenshot of the user menu (showing whether avatar appears)

This will pinpoint exactly where in the flow the avatar data is being lost.
