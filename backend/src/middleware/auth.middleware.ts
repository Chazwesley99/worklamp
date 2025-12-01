import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { prisma, tenantContext } from '../config/database';

// Extend Express Request type to include user and tenant info
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  tenantId?: string;
}

// Alias for convenience
export interface AuthRequest extends Request {
  user: TokenPayload;
}

/**
 * Middleware to verify JWT access token
 * Extracts token from Authorization header and verifies it
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication token is required',
        },
      });
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Attach user info to request
    (req as AuthenticatedRequest).user = payload;
    (req as AuthenticatedRequest).tenantId = payload.tenantId;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return res.status(401).json({
          error: {
            code: 'AUTH_TOKEN_EXPIRED',
            message: 'Authentication token has expired',
          },
        });
      }
    }

    return res.status(401).json({
      error: {
        code: 'AUTH_TOKEN_INVALID',
        message: 'Invalid authentication token',
      },
    });
  }
}

/**
 * Middleware to set tenant context for Prisma middleware
 * Must be used after authenticateToken middleware
 */
export function setTenantContext(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.tenantId) {
    return next();
  }

  // Run the rest of the request in the tenant context
  try {
    tenantContext.run({ tenantId: authReq.tenantId }, () => {
      next();
    });
  } catch (error) {
    console.error('Error in setTenantContext:', error);
    next(error);
  }
}

/**
 * Middleware to verify user has required role
 * Must be used after authenticateToken middleware
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication required',
        },
      });
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
          message: 'You do not have permission to access this resource',
        },
      });
    }

    next();
  };
}

/**
 * Middleware to inject tenant context into request
 * Verifies that the user belongs to the tenant
 * Must be used after authenticateToken middleware
 */
export async function injectTenantContext(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication required',
        },
      });
    }

    // Verify tenant membership
    const membership = await prisma.tenantMember.findFirst({
      where: {
        userId: authReq.user.userId,
        tenantId: authReq.user.tenantId,
      },
      include: {
        tenant: true,
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN_TENANT_MISMATCH',
          message: 'You do not have access to this tenant',
        },
      });
    }

    // Tenant context is already in req.tenantId from authenticateToken
    next();
  } catch (error) {
    console.error('Tenant context injection error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while verifying tenant access',
      },
    });
  }
}

/**
 * Middleware to verify resource belongs to user's tenant
 * Prevents cross-tenant access
 */
export function verifyTenantOwnership(
  resourceType: 'project' | 'task' | 'bug' | 'feature' | 'milestone' | 'channel'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.tenantId) {
        return res.status(401).json({
          error: {
            code: 'AUTH_TOKEN_MISSING',
            message: 'Authentication required',
          },
        });
      }

      const resourceId = req.params.id || req.params.projectId;

      if (!resourceId) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Resource ID is required',
          },
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resource: any = null;

      // Query based on resource type
      switch (resourceType) {
        case 'project':
          resource = await prisma.project.findUnique({
            where: { id: resourceId },
            select: { tenantId: true },
          });
          break;
        case 'task':
          resource = await prisma.task.findUnique({
            where: { id: resourceId },
            include: { project: { select: { tenantId: true } } },
          });
          break;
        case 'bug':
          resource = await prisma.bug.findUnique({
            where: { id: resourceId },
            include: { project: { select: { tenantId: true } } },
          });
          break;
        case 'feature':
          resource = await prisma.featureRequest.findUnique({
            where: { id: resourceId },
            include: { project: { select: { tenantId: true } } },
          });
          break;
        case 'milestone':
          resource = await prisma.milestone.findUnique({
            where: { id: resourceId },
            include: { project: { select: { tenantId: true } } },
          });
          break;
        case 'channel':
          resource = await prisma.channel.findUnique({
            where: { id: resourceId },
            include: { project: { select: { tenantId: true } } },
          });
          break;
      }

      if (!resource) {
        return res.status(404).json({
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: `${resourceType} not found`,
          },
        });
      }

      // Get tenantId from resource
      const resourceTenantId =
        resourceType === 'project' ? resource.tenantId : resource.project.tenantId;

      // Verify tenant ownership
      if (resourceTenantId !== authReq.tenantId) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_TENANT_MISMATCH',
            message: 'You do not have access to this resource',
          },
        });
      }

      next();
    } catch (error) {
      console.error('Tenant ownership verification error:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while verifying resource access',
        },
      });
    }
  };
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 * Useful for public endpoints that have different behavior for authenticated users
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        authReq.user = payload;
        authReq.tenantId = payload.tenantId;
      } catch (error) {
        // Token is invalid, but we don't fail the request
        // Just continue without user info
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

// Export authenticate as an alias for authenticateToken
export const authenticate = authenticateToken;
