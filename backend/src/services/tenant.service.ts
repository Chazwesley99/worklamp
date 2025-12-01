import { prisma } from '../config/database';

export class TenantService {
  /**
   * Get tenant information by ID
   */
  async getTenantById(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new Error('TENANT_NOT_FOUND');
    }

    return tenant;
  }

  /**
   * Update tenant settings
   */
  async updateTenant(tenantId: string, userId: string, data: { name?: string }) {
    // Verify user is the owner
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('TENANT_NOT_FOUND');
    }

    if (tenant.ownerId !== userId) {
      throw new Error('FORBIDDEN_NOT_OWNER');
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
      },
    });

    return updatedTenant;
  }

  /**
   * Get tenant members with their roles
   */
  async getTenantMembers(tenantId: string) {
    const members = await prisma.tenantMember.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return members;
  }

  /**
   * Check if tenant has reached project limit
   */
  async canCreateProject(tenantId: string): Promise<boolean> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new Error('TENANT_NOT_FOUND');
    }

    return tenant._count.projects < tenant.maxProjects;
  }

  /**
   * Check if tenant has reached team member limit
   */
  async canAddTeamMember(tenantId: string): Promise<boolean> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new Error('TENANT_NOT_FOUND');
    }

    return tenant._count.members < tenant.maxTeamMembers;
  }

  /**
   * Check if user has specific role in tenant
   */
  async hasRole(tenantId: string, userId: string, roles: string[]): Promise<boolean> {
    const membership = await prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });

    if (!membership) {
      return false;
    }

    return roles.includes(membership.role);
  }

  /**
   * Check if user is tenant owner
   */
  async isOwner(tenantId: string, userId: string): Promise<boolean> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    return tenant?.ownerId === userId;
  }

  /**
   * Get user's role in tenant
   */
  async getUserRole(tenantId: string, userId: string): Promise<string | null> {
    const membership = await prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });

    return membership?.role || null;
  }

  /**
   * Invite a user to the tenant
   */
  async inviteUser(
    tenantId: string,
    invitedByUserId: string,
    email: string,
    role: 'admin' | 'developer' | 'auditor'
  ) {
    // Verify inviter has permission (owner or admin)
    const inviterRole = await this.getUserRole(tenantId, invitedByUserId);
    if (!inviterRole || !['owner', 'admin'].includes(inviterRole)) {
      throw new Error('FORBIDDEN_INSUFFICIENT_PERMISSIONS');
    }

    // Check if tenant can add more members
    const canAdd = await this.canAddTeamMember(tenantId);
    if (!canAdd) {
      throw new Error('LIMIT_EXCEEDED_TEAM_MEMBERS');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // If user exists, check if they're already a member
    if (existingUser) {
      const existingMembership = await prisma.tenantMember.findUnique({
        where: {
          tenantId_userId: {
            tenantId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMembership) {
        throw new Error('USER_ALREADY_MEMBER');
      }
    }

    // Get tenant info for invitation email
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new Error('TENANT_NOT_FOUND');
    }

    return {
      email,
      role,
      tenantName: tenant.name,
      inviterName: tenant.owner.name,
      existingUser: !!existingUser,
    };
  }

  /**
   * Add user to tenant (after they accept invitation or register)
   */
  async addMemberToTenant(
    tenantId: string,
    userId: string,
    role: 'admin' | 'developer' | 'auditor'
  ) {
    // Check if tenant can add more members
    const canAdd = await this.canAddTeamMember(tenantId);
    if (!canAdd) {
      throw new Error('LIMIT_EXCEEDED_TEAM_MEMBERS');
    }

    // Check if user is already a member
    const existingMembership = await prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });

    if (existingMembership) {
      throw new Error('USER_ALREADY_MEMBER');
    }

    // Add user as tenant member
    const membership = await prisma.tenantMember.create({
      data: {
        tenantId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return membership;
  }

  /**
   * Remove member from tenant
   */
  async removeMember(tenantId: string, requestingUserId: string, memberUserId: string) {
    // Verify requester has permission (owner or admin)
    const requesterRole = await this.getUserRole(tenantId, requestingUserId);
    if (!requesterRole || !['owner', 'admin'].includes(requesterRole)) {
      throw new Error('FORBIDDEN_INSUFFICIENT_PERMISSIONS');
    }

    // Cannot remove the owner
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (tenant?.ownerId === memberUserId) {
      throw new Error('CANNOT_REMOVE_OWNER');
    }

    // Remove the member
    await prisma.tenantMember.delete({
      where: {
        tenantId_userId: {
          tenantId,
          userId: memberUserId,
        },
      },
    });

    return { success: true };
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    tenantId: string,
    requestingUserId: string,
    memberUserId: string,
    newRole: 'admin' | 'developer' | 'auditor'
  ) {
    // Verify requester has permission (owner or admin)
    const requesterRole = await this.getUserRole(tenantId, requestingUserId);
    if (!requesterRole || !['owner', 'admin'].includes(requesterRole)) {
      throw new Error('FORBIDDEN_INSUFFICIENT_PERMISSIONS');
    }

    // Cannot change the owner's role
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (tenant?.ownerId === memberUserId) {
      throw new Error('CANNOT_CHANGE_OWNER_ROLE');
    }

    // Update the role
    const updatedMembership = await prisma.tenantMember.update({
      where: {
        tenantId_userId: {
          tenantId,
          userId: memberUserId,
        },
      },
      data: {
        role: newRole,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updatedMembership;
  }
}

export const tenantService = new TenantService();
