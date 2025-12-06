# Skip Email Verification Feature

## Overview

Added the ability to skip email verification during user registration for development and testing purposes.

## Environment Variable

### `SKIP_EMAIL_VERIFICATION`

- **Type**: Boolean (string)
- **Default**: `false`
- **Values**: `true` or `false`
- **Purpose**: When set to `true`, new users will have their email automatically marked as verified in the database

## Changes Made

### 1. Environment Configuration

- Added `SKIP_EMAIL_VERIFICATION=true` to `backend/.env`
- Added `SKIP_EMAIL_VERIFICATION=false` to `backend/.env.example`

### 2. Auth Service (`backend/src/services/auth.service.ts`)

- Modified the `signup()` method to check the `SKIP_EMAIL_VERIFICATION` environment variable
- When enabled, sets `emailVerified: true` during user creation
- When disabled (default), sets `emailVerified: false` (existing behavior)

### 3. Auth Controller (`backend/src/controllers/auth.controller.ts`)

- Modified the `signup()` endpoint to skip sending verification emails when `SKIP_EMAIL_VERIFICATION=true`
- Updated the response message to reflect whether email verification is required

## Usage

### Development Mode (Skip Verification)

```env
SKIP_EMAIL_VERIFICATION=true
```

- Users can register and immediately log in without verifying their email
- No verification email is sent
- Response message: "User registered successfully. You can now log in."

### Production Mode (Require Verification)

```env
SKIP_EMAIL_VERIFICATION=false
```

- Users must verify their email before logging in (default behavior)
- Verification email is sent
- Response message: "User registered successfully. Please check your email to verify your account."

## Security Considerations

⚠️ **Important**: This feature should only be enabled in development/testing environments. In production, email verification should always be required to:

- Prevent spam accounts
- Verify user identity
- Ensure valid contact information
- Comply with security best practices

## Testing

To test the feature:

1. Set `SKIP_EMAIL_VERIFICATION=true` in your `.env` file
2. Register a new user via the signup endpoint
3. Verify the user can immediately log in without email verification
4. Check the database to confirm `emailVerified` is set to `true`
