import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

/**
 * Middleware to verify user has admin privileges
 * Must be used after authenticateToken middleware
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    return res.status(401).json({
      error: {
        code: 'AUTH_TOKEN_MISSING',
        message: 'Authentication required',
      },
    });
  }

  if (!authReq.user.isAdmin) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN_ADMIN_ONLY',
        message: 'This resource is only accessible to administrators',
      },
    });
  }

  next();
}
