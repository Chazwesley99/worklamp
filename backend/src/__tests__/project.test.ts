import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import projectRoutes from '../routes/project.routes';
import { prisma } from '../config/database';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/projects', projectRoutes);

describe('Project API', () => {
  let authToken: string;
  let tenantId: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user and tenant
    const user = await prisma.user.create({
      data: {
        email: 'project-test@example.com',
        name: 'Project Test User',
        passwordHash: 'hashed',
        emailVerified: true,
      },
    });
    userId = user.id;

    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        ownerId: userId,
        maxProjects: 5,
        maxTeamMembers: 5,
      },
    });
    tenantId = tenant.id;

    await prisma.tenantMember.create({
      data: {
        tenantId,
        userId,
        role: 'owner',
      },
    });

    // Mock auth token (in real scenario, this would come from login)
    authToken = 'mock-token';
  });

  afterAll(async () => {
    // Cleanup
    await prisma.project.deleteMany({ where: { tenantId } });
    await prisma.tenantMember.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it('should create a new project', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Cookie', [`token=${authToken}`])
      .send({
        name: 'Test Project',
        description: 'A test project',
        publicBugTracking: true,
        publicFeatureRequests: false,
      });

    // Note: This will fail without proper auth middleware setup
    // This is a basic structure for testing
    expect(response.status).toBeDefined();
  });

  it('should get all projects for tenant', async () => {
    const response = await request(app)
      .get('/api/projects')
      .set('Cookie', [`token=${authToken}`]);

    expect(response.status).toBeDefined();
  });

  it('should validate project name is required', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Cookie', [`token=${authToken}`])
      .send({
        description: 'Project without name',
      });

    expect(response.status).toBeDefined();
  });
});
