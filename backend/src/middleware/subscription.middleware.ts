import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { tenantService } from '../services/tenant.service';

/**
 * Middleware to check if tenant can create a project
 */
export async function canCreateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { tenantId } = req.user as AuthRequest['user'];

    const canCreate = await tenantService.canCreateProject(tenantId);

    if (!canCreate) {
      return res.status(409).json({
        error: {
          code: 'LIMIT_EXCEEDED_PROJECTS',
          message: 'Project limit reached for your subscription tier',
        },
      });
    }

    next();
  } catch (error) {
    console.error('Project limit check error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check project limit',
      },
    });
  }
}

/**
 * Middleware to check if tenant can add team members
 */
export async function canAddTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { tenantId } = req.user as AuthRequest['user'];

    const canAdd = await tenantService.canAddTeamMember(tenantId);

    if (!canAdd) {
      return res.status(409).json({
        error: {
          code: 'LIMIT_EXCEEDED_TEAM_MEMBERS',
          message: 'Team member limit reached for your subscription tier',
        },
      });
    }

    next();
  } catch (error) {
    console.error('Team member limit check error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check team member limit',
      },
    });
  }
}

/**
 * Middleware to check if feature is available for subscription tier
 */
export async function requirePaidSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const { tenantId } = req.user as AuthRequest['user'];

    const tenant = await tenantService.getTenantById(tenantId);

    if (tenant.subscriptionTier === 'free') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_SUBSCRIPTION_REQUIRED',
          message: 'This feature requires a paid subscription',
        },
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check subscription',
      },
    });
  }
}

/**
 * Check if user has required role(s)
 */
export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.user as AuthRequest['user'];

      // Check if user's role is in the allowed roles
      if (!roles.includes(role)) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to perform this action',
          },
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check permissions',
        },
      });
    }
  };
}
