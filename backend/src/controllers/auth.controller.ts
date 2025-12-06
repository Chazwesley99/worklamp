import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { emailService } from '../services/email.service';
import { signupSchema, loginSchema, verifyEmailSchema } from '../validators/auth.validator';

export class AuthController {
  /**
   * POST /api/auth/signup
   * Register a new user
   */
  async signup(req: Request, res: Response) {
    try {
      // Validate input
      const validatedData = signupSchema.parse(req.body);

      // Create user
      const { user, verificationToken } = await authService.signup(validatedData);

      // Send verification email only if email verification is not skipped
      const skipEmailVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true';

      if (!skipEmailVerification) {
        await emailService.sendVerificationEmail(user.email, verificationToken);
      }

      const message = skipEmailVerification
        ? 'User registered successfully. You can now log in.'
        : 'User registered successfully. Please check your email to verify your account.';

      res.status(201).json({
        message,
        user,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'EMAIL_ALREADY_EXISTS') {
          return res.status(409).json({
            error: {
              code: 'EMAIL_ALREADY_EXISTS',
              message: 'An account with this email already exists',
            },
          });
        }

        // Zod validation error
        if (error.name === 'ZodError') {
          return res.status(400).json({
            error: {
              code: 'VALIDATION_FAILED',
              message: 'Validation failed',
              details: error,
            },
          });
        }
      }

      console.error('Signup error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during signup',
        },
      });
    }
  }

  /**
   * POST /api/auth/verify-email
   * Verify user email with token
   */
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = verifyEmailSchema.parse(req.body);

      await authService.verifyEmail(token);

      res.json({
        message: 'Email verified successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_VERIFICATION_TOKEN') {
          return res.status(400).json({
            error: {
              code: 'INVALID_VERIFICATION_TOKEN',
              message: 'Invalid or expired verification token',
            },
          });
        }
      }

      console.error('Email verification error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during email verification',
        },
      });
    }
  }

  /**
   * POST /api/auth/login
   * Login user with email and password
   */
  async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);

      const { user, tokens } = await authService.login(validatedData);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.json({
        message: 'Login successful',
        user,
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_CREDENTIALS') {
          return res.status(401).json({
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password',
            },
          });
        }

        if (error.message === 'EMAIL_NOT_VERIFIED') {
          return res.status(403).json({
            error: {
              code: 'EMAIL_NOT_VERIFIED',
              message: 'Please verify your email before logging in',
            },
          });
        }

        if (error.message === 'NO_TENANT_MEMBERSHIP') {
          return res.status(403).json({
            error: {
              code: 'NO_TENANT_MEMBERSHIP',
              message: 'User is not associated with any tenant',
            },
          });
        }
      }

      console.error('Login error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during login',
        },
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  async refresh(req: Request, res: Response) {
    try {
      // Get refresh token from cookie or body
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          error: {
            code: 'REFRESH_TOKEN_MISSING',
            message: 'Refresh token is required',
          },
        });
      }

      const tokens = await authService.refreshAccessToken(refreshToken);

      // Set new refresh token in cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        accessToken: tokens.accessToken,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_REFRESH_TOKEN') {
        return res.status(401).json({
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        });
      }

      console.error('Token refresh error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during token refresh',
        },
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user
   */
  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      const authReq = req as { user?: { userId: string } };
      const userId = authReq.user?.userId;

      if (refreshToken && userId) {
        await authService.logout(userId, refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during logout',
        },
      });
    }
  }

  /**
   * POST /api/auth/accept-invitation
   * Accept tenant invitation (for existing users)
   */
  async acceptInvitation(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const authReq = req as { user?: { userId: string } };
      const userId = authReq.user?.userId;

      if (!token) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invitation token is required',
          },
        });
      }

      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
      }

      const result = await authService.acceptInvitation(userId, token);

      res.json({
        message: 'Invitation accepted successfully',
        tenant: result.tenant,
        role: result.role,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_INVITATION_TOKEN') {
          return res.status(400).json({
            error: {
              code: 'INVALID_INVITATION_TOKEN',
              message: 'Invalid or expired invitation token',
            },
          });
        }

        if (error.message === 'EMAIL_MISMATCH') {
          return res.status(400).json({
            error: {
              code: 'EMAIL_MISMATCH',
              message: 'This invitation was sent to a different email address',
            },
          });
        }

        if (error.message === 'LIMIT_EXCEEDED_TEAM_MEMBERS') {
          return res.status(409).json({
            error: {
              code: 'LIMIT_EXCEEDED_TEAM_MEMBERS',
              message: 'Team member limit reached for this tenant',
            },
          });
        }

        if (error.message === 'USER_ALREADY_MEMBER') {
          return res.status(409).json({
            error: {
              code: 'USER_ALREADY_MEMBER',
              message: 'You are already a member of this tenant',
            },
          });
        }
      }

      console.error('Accept invitation error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while accepting invitation',
        },
      });
    }
  }
}

export const authController = new AuthController();
