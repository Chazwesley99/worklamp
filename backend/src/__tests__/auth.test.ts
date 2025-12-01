import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from '../config/database';

describe('Authentication API', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123',
    name: 'Test User',
    agreeToTerms: true,
    agreeToEmails: true,
  };

  let verificationToken: string;
  let accessToken: string;

  afterAll(async () => {
    // Cleanup: delete test user and related data
    try {
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      if (user) {
        // Delete tenant memberships
        await prisma.tenantMember.deleteMany({
          where: { userId: user.id },
        });

        // Delete tenants owned by user
        await prisma.tenant.deleteMany({
          where: { ownerId: user.id },
        });

        // Delete user
        await prisma.user.delete({
          where: { id: user.id },
        });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app).post('/api/auth/signup').send(testUser).expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.emailVerified).toBe(false);
      expect(response.body).toHaveProperty('verificationToken');

      verificationToken = response.body.verificationToken;
    });

    it('should reject duplicate email registration', async () => {
      const response = await request(app).post('/api/auth/signup').send(testUser).expect(409);

      expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          ...testUser,
          email: 'another@example.com',
          password: 'weak',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken })
        .expect(200);

      expect(response.body.message).toContain('verified');
    });

    it('should reject invalid verification token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_VERIFICATION_TOKEN');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe(testUser.email);

      accessToken = response.body.accessToken;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123',
        })
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toContain('Logout successful');
    });
  });
});
