import { prisma } from '../config/database';
import { hashPassword } from '../utils/password';
import bcrypt from 'bcrypt';

export interface UpdateUserProfileData {
  name?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  /**
   * Get user profile by ID
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
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, data: UpdateUserProfileData) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        authProvider: true,
        emailVerified: true,
        emailOptIn: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Change user password (email users only)
   */
  async changePassword(userId: string, data: ChangePasswordData): Promise<void> {
    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        authProvider: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is email-authenticated
    if (user.authProvider !== 'email') {
      throw new Error('Password change is only available for email users');
    }

    if (!user.passwordHash) {
      throw new Error('User has no password set');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(data.newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update user avatar URL
   */
  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        authProvider: true,
        emailVerified: true,
        emailOptIn: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

export const userService = new UserService();
