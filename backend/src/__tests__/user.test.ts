import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from '../config/database';
import { generateTokens } from '../utils/jwt';

describe('User Profile API', () => {
  let testUserId: string;
  let testTenantId: string;
  let accessToken: string;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: `test-user-${Date.now()}@example.com`,
        name: 'Test User',
        passwordHash: 'hashed-password',
        authProvider: 'email',
        emailVerified: true,
        emailOptIn: true,
      },
    });

    testUserId = user.id;

    // Create a tenant for the user
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        ownerId: user.id,
        subscriptionTier: 'free',
        maxProjects: 1,
        maxTeamMembers: 1,
      },
    });

    testTenantId = tenant.id;

    // Create tenant membership
    await prisma.tenantMember.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        role: 'owner',
      },
    });

    // Generate access token
    const tokens = await generateTokens({
      userId: user.id,
      tenantId: tenant.id,
      role: 'owner',
      email: user.email,
    });

    accessToken = tokens.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    try {
      await prisma.tenantMember.deleteMany({
        where: { userId: testUserId },
      });

      await prisma.tenant.deleteMany({
        where: { id: testTenantId },
      });

      await prisma.user.delete({
        where: { id: testUserId },
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('GET /api/users/me', () => {
    it('should return current user profile', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testUserId);
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('authProvider', 'email');
    });

    it('should return 401 without authentication', async () => {
      await request(app).get('/api/users/me').expect(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Updated Name');
    });

    it('should return 400 for invalid data', async () => {
      await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('PATCH /api/users/me/password', () => {
    it('should return 400 for incorrect current password', async () => {
      const response = await request(app)
        .patch('/api/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123',
          newPassword: 'NewPassword123',
        })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_PASSWORD');
    });

    it('should return 400 for weak new password', async () => {
      await request(app)
        .patch('/api/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'TestPassword123',
          newPassword: 'weak',
        })
        .expect(400);
    });
  });
});
