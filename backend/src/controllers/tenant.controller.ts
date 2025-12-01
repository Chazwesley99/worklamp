import { Request, Response } from 'express';
import { tenantService } from '../services/tenant.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class TenantController {
  /**
   * Get current tenant information
   * GET /api/tenants/me
   */
  async getCurrentTenant(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as AuthRequest['user'];

      const tenant = await tenantService.getTenantById(tenantId);

      res.json({
        id: tenant.id,
        name: tenant.name,
        subscriptionTier: tenant.subscriptionTier,
        maxProjects: tenant.maxProjects,
        maxTeamMembers: tenant.maxTeamMembers,
        owner: tenant.owner,
        projectCount: tenant._count.projects,
        memberCount: tenant._count.members,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      });
    } catch (error: any) {
      console.error('Get current tenant error:', error);

      if (error.message === 'TENANT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'TENANT_NOT_FOUND',
            message: 'Tenant not found',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get tenant information',
        },
      });
    }
  }

  /**
   * Update tenant settings
   * PATCH /api/tenants/me
   */
  async updateTenant(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as AuthRequest['user'];
      const { name } = req.body;

      const updatedTenant = await tenantService.updateTenant(tenantId, userId, {
        name,
      });

      res.json({
        id: updatedTenant.id,
        name: updatedTenant.name,
        subscriptionTier: updatedTenant.subscriptionTier,
        maxProjects: updatedTenant.maxProjects,
        maxTeamMembers: updatedTenant.maxTeamMembers,
        updatedAt: updatedTenant.updatedAt,
      });
    } catch (error: any) {
      console.error('Update tenant error:', error);

      if (error.message === 'TENANT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'TENANT_NOT_FOUND',
            message: 'Tenant not found',
          },
        });
      }

      if (error.message === 'FORBIDDEN_NOT_OWNER') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_NOT_OWNER',
            message: 'Only the tenant owner can update settings',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update tenant',
        },
      });
    }
  }

  /**
   * Get tenant members
   * GET /api/tenants/me/members
   */
  async getTenantMembers(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as AuthRequest['user'];

      const members = await tenantService.getTenantMembers(tenantId);

      res.json({
        members: members.map((member) => ({
          id: member.id,
          role: member.role,
          user: member.user,
          createdAt: member.createdAt,
        })),
      });
    } catch (error: any) {
      console.error('Get tenant members error:', error);

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get tenant members',
        },
      });
    }
  }

  /**
   * Invite user to tenant
   * POST /api/tenants/me/invite
   */
  async inviteUser(req: Request, res: Response) {
    try {
      const { tenantId, userId } = req.user as AuthRequest['user'];
      const { email, role } = req.body;

      // Validate role
      if (!['admin', 'developer', 'auditor'].includes(role)) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid role. Must be admin, developer, or auditor',
          },
        });
      }

      const invitationData = await tenantService.inviteUser(tenantId, userId, email, role);

      // Generate invitation token
      const { emailService } = await import('../services/email.service');
      const invitationToken = emailService.generateInvitationToken(tenantId, email, role);

      // Send invitation email
      await emailService.sendInvitationEmail(
        email,
        invitationData.inviterName,
        invitationData.tenantName,
        invitationToken
      );

      res.json({
        success: true,
        message: 'Invitation sent successfully',
        email,
        role,
      });
    } catch (error: any) {
      console.error('Invite user error:', error);

      if (error.message === 'FORBIDDEN_INSUFFICIENT_PERMISSIONS') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
            message: 'Only owners and admins can invite users',
          },
        });
      }

      if (error.message === 'LIMIT_EXCEEDED_TEAM_MEMBERS') {
        return res.status(409).json({
          error: {
            code: 'LIMIT_EXCEEDED_TEAM_MEMBERS',
            message: 'Team member limit reached for this subscription',
          },
        });
      }

      if (error.message === 'USER_ALREADY_MEMBER') {
        return res.status(409).json({
          error: {
            code: 'USER_ALREADY_MEMBER',
            message: 'User is already a member of this tenant',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send invitation',
        },
      });
    }
  }

  /**
   * Remove member from tenant
   * DELETE /api/tenants/members/:userId
   */
  async removeMember(req: Request, res: Response) {
    try {
      const { tenantId, userId: requestingUserId } = req.user as AuthRequest['user'];
      const { userId: memberUserId } = req.params;

      await tenantService.removeMember(tenantId, requestingUserId, memberUserId);

      res.json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error: any) {
      console.error('Remove member error:', error);

      if (error.message === 'FORBIDDEN_INSUFFICIENT_PERMISSIONS') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
            message: 'Only owners and admins can remove members',
          },
        });
      }

      if (error.message === 'CANNOT_REMOVE_OWNER') {
        return res.status(400).json({
          error: {
            code: 'CANNOT_REMOVE_OWNER',
            message: 'Cannot remove the tenant owner',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove member',
        },
      });
    }
  }

  /**
   * Update member role
   * PATCH /api/tenants/members/:userId/role
   */
  async updateMemberRole(req: Request, res: Response) {
    try {
      const { tenantId, userId: requestingUserId } = req.user as AuthRequest['user'];
      const { userId: memberUserId } = req.params;
      const { role } = req.body;

      // Validate role
      if (!['admin', 'developer', 'auditor'].includes(role)) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid role. Must be admin, developer, or auditor',
          },
        });
      }

      const updatedMembership = await tenantService.updateMemberRole(
        tenantId,
        requestingUserId,
        memberUserId,
        role
      );

      res.json({
        id: updatedMembership.id,
        role: updatedMembership.role,
        user: updatedMembership.user,
      });
    } catch (error: any) {
      console.error('Update member role error:', error);

      if (error.message === 'FORBIDDEN_INSUFFICIENT_PERMISSIONS') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
            message: 'Only owners and admins can update member roles',
          },
        });
      }

      if (error.message === 'CANNOT_CHANGE_OWNER_ROLE') {
        return res.status(400).json({
          error: {
            code: 'CANNOT_CHANGE_OWNER_ROLE',
            message: 'Cannot change the role of the tenant owner',
          },
        });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update member role',
        },
      });
    }
  }
}

export const tenantController = new TenantController();
