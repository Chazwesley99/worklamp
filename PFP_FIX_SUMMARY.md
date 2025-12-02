# Profile Picture (PFP) Issue - Comprehensive Investigation

## Problem Statement

New Google OAuth users are not seeing their profile pictures in the user menu after login, even though existing users who have visited their profile page can see their PFPs.

## Complete Data Flow Analysis

### 1. Google OAuth Login Flow

```
User clicks "Sign in with Google"
  ↓
Redirected to Google OAuth
  ↓
Google returns profile data (email, name, photo URL)
  ↓
Backend passport.ts receives profile
  ↓
User created/updated in database with avatarUrl
  ↓
JWT token generated (contains userId, tenantId, role, email - NO avatarUrl)
  ↓
Frontend receives token via redirect
  ↓
Frontend stores token in localStorage
  ↓
Frontend calls refreshUser()
  ↓
API call to /api/users/me with Bearer token
  ↓
Backend fetches user from database
  ↓
Backend returns full user object (including avatarUrl)
  ↓
Frontend AuthContext updates user state
  ↓
DashboardLayout UserMenu renders with user.avatarUrl
```

### 2. Key Points in the Flow

**JWT Token Does NOT Contain Avatar**

- The JWT only contains: userId, tenantId, role, email
- Avatar must be fetched separately via /api/users/me
- This is by design to keep tokens small

**Avatar is Stored in Database**

- Field: `User.avatarUrl` (String, nullable)
- Set during OAuth in `passport.ts`
- Retrieved by `userService.getUserById()`

**Frontend Fetches Avatar After Login**

- OAuth callback page calls `refreshUser()`
- This triggers `loadUser()` which calls `/api/users/me`
- Response should include `avatarUrl`

## Debugging Strategy

I've added comprehensive logging at EVERY step of the flow:

### Backend Logs (8 checkpoints)

1. Google profile data received
2. User creation with avatarUrl
3. User created confirmation
4. User reloaded after tenant creation
5. getUserById database query result
6. HTTP response being sent to client

### Frontend Logs (5 checkpoints)

1. OAuth callback token received
2. API response from getCurrentUser
3. AuthContext user state updated
4. OAuth callback complete
5. UserMenu component receives user data

## Testing Instructions

### Prerequisites

- Backend running on port 3001
- Frontend running on port 3000
- Browser DevTools Console open (F12)
- Backend terminal visible for logs

### Test Steps

1. Use a BRAND NEW Google account (never logged in before)
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Watch BOTH backend terminal AND browser console
5. Check if avatar appears in top-right user menu

### What to Capture

1. **All backend console logs** (copy entire OAuth sequence)
2. **All frontend console logs** (copy from browser DevTools)
3. **Screenshot of user menu** (showing whether avatar appears)
4. **Database verification**: Run `npx prisma studio` and check User table

## Possible Root Causes

### Hypothesis 1: Google Not Providing Photo

- Check: `[OAUTH DEBUG] Google profile data` log
- Look for: `hasPhoto: false`
- Solution: Google account may not have a profile picture set

### Hypothesis 2: Database Write Failure

- Check: Compare "User created" vs "getUserById" logs
- Look for: avatarUrl present in creation but missing in retrieval
- Solution: Database constraint or migration issue

### Hypothesis 3: API Serialization Issue

- Check: Compare backend "Returning user" vs frontend "API response" logs
- Look for: avatarUrl in backend but missing in frontend
- Solution: API response serialization problem

### Hypothesis 4: State Management Issue

- Check: Compare "API response" vs "User loaded" vs "User Menu" logs
- Look for: avatarUrl in API but missing in component
- Solution: React state update timing issue

### Hypothesis 5: Rendering Condition Issue

- Check: "User Menu" log shows avatarUrl but image doesn't render
- Look for: hasAvatar: true but no image visible
- Solution: Image URL invalid or rendering logic broken

## Files Modified for Debugging

### Backend

- `backend/src/config/passport.ts` - OAuth strategy logging
- `backend/src/services/user.service.ts` - Database query logging
- `backend/src/controllers/user.controller.ts` - HTTP response logging

### Frontend

- `frontend/lib/api/auth.ts` - API response logging
- `frontend/lib/contexts/AuthContext.tsx` - State update logging
- `frontend/app/auth/callback/page.tsx` - OAuth callback logging
- `frontend/components/layout/DashboardLayout.tsx` - Component render logging

## Next Steps

After running the test:

1. Share all logs (backend + frontend)
2. Share database screenshot from Prisma Studio
3. Share screenshot of user menu
4. I'll analyze the logs to pinpoint the exact failure point
5. Implement targeted fix based on findings

## Important Notes

- These debug logs are TEMPORARY for investigation
- They should be removed after the issue is fixed
- They contain sensitive data (emails, user IDs) - don't share publicly
- The logs will show exactly where in the 13-step flow the avatar data is lost
