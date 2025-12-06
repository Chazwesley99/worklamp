import { prisma } from '../config/database';

export interface UpdateUserAdminData {
  name?: string;
  email?: string;
  emailVerified?: boolean;
  isAdmin?: boolean;
}

export interface UpdateTenantData {
  subscriptionTier?: string;
  maxProjects?: number;
  maxTeamMembers?: number;
}

export class AdminService {
  /**
   * Get all users with pagination and search
   */
  async getAllUsers(page: number = 1, limit: number = 50, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          authProvider: true,
          emailVerified: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
          ownedTenants: {
            select: {
              id: true,
              name: true,
              subscriptionTier: true,
              maxProjects: true,
              maxTeamMembers: true,
            },
          },
          tenantMemberships: {
            select: {
              role: true,
              tenant: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID with full details
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        authProvider: true,
        emailVerified: true,
        emailOptIn: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        ownedTenants: {
          select: {
            id: true,
            name: true,
            subscriptionTier: true,
            maxProjects: true,
            maxTeamMembers: true,
            createdAt: true,
            _count: {
              select: {
                projects: true,
                members: true,
              },
            },
          },
        },
        tenantMemberships: {
          select: {
            id: true,
            role: true,
            createdAt: true,
            tenant: {
              select: {
                id: true,
                name: true,
                subscriptionTier: true,
              },
            },
          },
        },
      },
    });

    return user;
  }

  /**
   * Update user (admin only)
   */
  async updateUser(userId: string, data: UpdateUserAdminData) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.emailVerified !== undefined && { emailVerified: data.emailVerified }),
        ...(data.isAdmin !== undefined && { isAdmin: data.isAdmin }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        authProvider: true,
        emailVerified: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Update user's tenant subscription
   */
  async updateUserTenant(tenantId: string, data: UpdateTenantData) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(data.subscriptionTier !== undefined && { subscriptionTier: data.subscriptionTier }),
        ...(data.maxProjects !== undefined && { maxProjects: data.maxProjects }),
        ...(data.maxTeamMembers !== undefined && { maxTeamMembers: data.maxTeamMembers }),
        updatedAt: new Date(),
      },
    });

    return updatedTenant;
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Get platform statistics
   */
  async getStats() {
    const [
      totalUsers,
      totalTenants,
      totalProjects,
      totalTasks,
      totalBugs,
      totalFeatures,
      verifiedUsers,
      adminUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.tenant.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.bug.count(),
      prisma.featureRequest.count(),
      prisma.user.count({ where: { emailVerified: true } }),
      prisma.user.count({ where: { isAdmin: true } }),
    ]);

    return {
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        admins: adminUsers,
      },
      tenants: totalTenants,
      projects: totalProjects,
      tasks: totalTasks,
      bugs: totalBugs,
      features: totalFeatures,
    };
  }
}

export const adminService = new AdminService();
