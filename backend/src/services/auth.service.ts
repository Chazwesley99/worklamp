import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateTokens,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  TokenPair,
} from '../utils/jwt';
import type { SignupInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
  /**
   * Register a new user with email and password
   */
  async signup(data: SignupInput): Promise<{
    user: { id: string; email: string; name: string; emailVerified: boolean; createdAt: Date };
    verificationToken: string;
  }> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Check if email verification should be skipped (for development)
    const skipEmailVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true';

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        authProvider: 'email',
        emailVerified: skipEmailVerification,
        emailOptIn: data.agreeToEmails,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Create tenant for the user (free tier by default)
    const tenant = await prisma.tenant.create({
      data: {
        name: `${data.name}'s Workspace`,
        ownerId: user.id,
        subscriptionTier: 'free',
        maxProjects: 1,
        maxTeamMembers: 1,
      },
    });

    // Add user as tenant member with owner role
    await prisma.tenantMember.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        role: 'owner',
      },
    });

    // Check if user should be admin based on ADMIN_EMAIL
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && user.email === adminEmail) {
      // Admin privileges can be handled through role or separate flag
      // For now, we'll just note this in logs
      console.log(`Admin user registered: ${user.email}`);
    }

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken(user.id, user.email);

    return { user, verificationToken };
  }

  /**
   * Verify user email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean }> {
    try {
      const { userId, email } = verifyEmailVerificationToken(token);

      // Update user email verification status
      await prisma.user.update({
        where: { id: userId, email },
        data: { emailVerified: true },
      });

      return { success: true };
    } catch (error) {
      throw new Error('INVALID_VERIFICATION_TOKEN');
    }
  }

  /**
   * Login user with email and password
   */
  async login(data: LoginInput): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
      avatarUrl: string | null;
      tenantId: string;
      role: string;
    };
    tokens: TokenPair;
  }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        tenantMemberships: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    // Get user's primary tenant (first membership, typically owner)
    const primaryMembership = user.tenantMemberships[0];
    if (!primaryMembership) {
      throw new Error('NO_TENANT_MEMBERSHIP');
    }

    // Generate tokens
    const tokens = await generateTokens({
      userId: user.id,
      tenantId: primaryMembership.tenantId,
      role: primaryMembership.role,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        tenantId: primaryMembership.tenantId,
        role: primaryMembership.role,
      },
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const { userId } = await verifyRefreshToken(refreshToken);

      // Get user with tenant membership
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          tenantMemberships: {
            include: {
              tenant: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      const primaryMembership = user.tenantMemberships[0];
      if (!primaryMembership) {
        throw new Error('NO_TENANT_MEMBERSHIP');
      }

      // Revoke old refresh token
      await revokeRefreshToken(userId, refreshToken);

      // Generate new tokens
      const tokens = await generateTokens({
        userId: user.id,
        tenantId: primaryMembership.tenantId,
        role: primaryMembership.role,
        email: user.email,
        isAdmin: user.isAdmin,
      });

      return tokens;
    } catch (error) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    await revokeRefreshToken(userId, refreshToken);
  }

  /**
   * Logout user from all devices by revoking all refresh tokens
   */
  async logoutAll(userId: string): Promise<void> {
    await revokeAllRefreshTokens(userId);
  }

  /**
   * Accept tenant invitation
   */
  async acceptInvitation(
    userId: string,
    invitationToken: string
  ): Promise<{
    tenant: { id: string; name: string };
    role: string;
  }> {
    try {
      // Import email service to verify token
      const { emailService } = await import('./email.service');
      const { tenantId, email, role } = emailService.verifyInvitationToken(invitationToken);

      // Get user to verify email matches
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (user.email !== email) {
        throw new Error('EMAIL_MISMATCH');
      }

      // Import tenant service to add member
      const { tenantService } = await import('./tenant.service');
      await tenantService.addMemberToTenant(tenantId, userId, role as any);

      // Get tenant info
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          id: true,
          name: true,
        },
      });

      if (!tenant) {
        throw new Error('TENANT_NOT_FOUND');
      }

      return {
        tenant,
        role,
      };
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new Error('INVALID_INVITATION_TOKEN');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
