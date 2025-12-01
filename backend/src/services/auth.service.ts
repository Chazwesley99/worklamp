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

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        authProvider: 'email',
        emailVerified: false,
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
}

export const authService = new AuthService();
