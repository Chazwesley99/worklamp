import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { imageService } from '../services/image.service';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator';
import { ZodError } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class UserController {
  /**
   * GET /api/users/me - Get current user profile
   */
  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'AUTH_TOKEN_MISSING',
            message: 'Authentication required',
          },
          statusCode: 401,
        });
      }

      const user = await userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
          statusCode: 404,
        });
      }

      console.log('[USER CONTROLLER DEBUG] Returning user to client:', {
        userId: user.id,
        email: user.email,
        avatarUrl: user.avatarUrl,
        hasAvatar: !!user.avatarUrl,
      });

      res.json(user);
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get user profile',
        },
        statusCode: 500,
      });
    }
  }

  /**
   * PATCH /api/users/me - Update current user profile
   */
  async updateMe(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'AUTH_TOKEN_MISSING',
            message: 'Authentication required',
          },
          statusCode: 401,
        });
      }

      // Validate input
      const validatedData = updateProfileSchema.parse(req.body);

      // Update user profile
      const user = await userService.updateUserProfile(userId, validatedData);

      res.json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors,
          },
          statusCode: 400,
        });
      }

      console.error('Error updating user profile:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user profile',
        },
        statusCode: 500,
      });
    }
  }

  /**
   * PATCH /api/users/me/password - Change user password (email users only)
   */
  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'AUTH_TOKEN_MISSING',
            message: 'Authentication required',
          },
          statusCode: 401,
        });
      }

      // Validate input
      const validatedData = changePasswordSchema.parse(req.body);

      // Change password
      await userService.changePassword(userId, validatedData);

      res.json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Validation failed',
            details: error.errors,
          },
          statusCode: 400,
        });
      }

      if (error instanceof Error) {
        if (error.message === 'User not found') {
          return res.status(404).json({
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
            statusCode: 404,
          });
        }

        if (error.message === 'Password change is only available for email users') {
          return res.status(403).json({
            error: {
              code: 'FORBIDDEN_OAUTH_USER',
              message: 'Password change is only available for email users',
            },
            statusCode: 403,
          });
        }

        if (error.message === 'Current password is incorrect') {
          return res.status(400).json({
            error: {
              code: 'INVALID_PASSWORD',
              message: 'Current password is incorrect',
            },
            statusCode: 400,
          });
        }
      }

      console.error('Error changing password:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password',
        },
        statusCode: 500,
      });
    }
  }

  /**
   * POST /api/users/me/avatar - Upload user avatar
   */
  async uploadAvatar(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'AUTH_TOKEN_MISSING',
            message: 'Authentication required',
          },
          statusCode: 401,
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Avatar image is required',
          },
          statusCode: 400,
        });
      }

      // Validate image
      const isValid = await imageService.validateImage(req.file.buffer);
      if (!isValid) {
        return res.status(400).json({
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Invalid image file',
          },
          statusCode: 400,
        });
      }

      // Optimize and upload avatar
      const result = await imageService.optimizeAvatar(req.file.buffer, req.file.originalname);

      // Update user avatar
      const user = await userService.updateAvatar(userId, result.url);

      res.json({
        ...user,
        uploadInfo: {
          originalSize: result.originalSize,
          optimizedSize: result.optimizedSize,
          compressionRatio: (
            ((result.originalSize - result.optimizedSize) / result.originalSize) *
            100
          ).toFixed(2),
        },
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload avatar',
        },
        statusCode: 500,
      });
    }
  }
}

export const userController = new UserController();
