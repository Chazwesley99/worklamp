import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import taskRoutes from '../routes/task.routes';
import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', taskRoutes);

describe('Task API', () => {
  let authToken: string;
  let tenantId: string;
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    // Create test user and tenant
    const user = await prisma.user.create({
      data: {
        email: 'task-test@example.com',
        name: 'Task Test User',
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

    // Create test project
    const project = await prisma.project.create({
      data: {
        tenantId,
        name: 'Test Project',
        description: 'A test project',
      },
    });
    projectId = project.id;

    // Generate auth token without Redis
    authToken = jwt.sign(
      {
        userId,
        tenantId,
        role: 'owner',
        email: user.email,
      },
      process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
      { expiresIn: '15m' }
    );
  });

  afterAll(async () => {
    // Cleanup
    await prisma.task.deleteMany({ where: { projectId } });
    await prisma.project.delete({ where: { id: projectId } });
    await prisma.tenantMember.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it('should create a new task', async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Task',
        description: 'A test task',
        category: 'Testing',
        priority: 50,
        status: 'todo',
      });

    expect(response.status).toBe(201);
    expect(response.body.task).toBeDefined();
    expect(response.body.task.title).toBe('Test Task');
    expect(response.body.task.category).toBe('Testing');
    expect(response.body.task.priority).toBe(50);
  });

  it('should get all tasks for a project', async () => {
    const response = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.tasks).toBeDefined();
    expect(Array.isArray(response.body.tasks)).toBe(true);
  });

  it('should validate task title is required', async () => {
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Task without title',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('should update a task', async () => {
    // Create a task first
    const createResponse = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Task to Update',
        status: 'todo',
      });

    const taskId = createResponse.body.task.id;

    // Update the task
    const updateResponse = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Updated Task',
        status: 'in-progress',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.task.title).toBe('Updated Task');
    expect(updateResponse.body.task.status).toBe('in-progress');
  });

  it('should delete a task', async () => {
    // Create a task first
    const createResponse = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Task to Delete',
      });

    const taskId = createResponse.body.task.id;

    // Delete the task
    const deleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);

    // Verify task is deleted
    const getResponse = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${authToken}`);

    interface TaskResponse {
      id: string;
    }
    const deletedTask = getResponse.body.tasks.find((t: TaskResponse) => t.id === taskId);
    expect(deletedTask).toBeUndefined();
  });
});

describe('Comment API', () => {
  let authToken: string;
  let tenantId: string;
  let userId: string;
  let projectId: string;
  let taskId: string;

  beforeAll(async () => {
    // Create test user and tenant
    const user = await prisma.user.create({
      data: {
        email: 'comment-test@example.com',
        name: 'Comment Test User',
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

    // Create test project and task
    const project = await prisma.project.create({
      data: {
        tenantId,
        name: 'Test Project',
      },
    });
    projectId = project.id;

    const task = await prisma.task.create({
      data: {
        projectId,
        title: 'Test Task',
        createdById: userId,
      },
    });
    taskId = task.id;

    // Generate auth token without Redis
    authToken = jwt.sign(
      {
        userId,
        tenantId,
        role: 'owner',
        email: user.email,
      },
      process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
      { expiresIn: '15m' }
    );
  });

  afterAll(async () => {
    // Cleanup
    await prisma.comment.deleteMany({ where: { resourceId: taskId } });
    await prisma.task.delete({ where: { id: taskId } });
    await prisma.project.delete({ where: { id: projectId } });
    await prisma.tenantMember.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it('should create a comment', async () => {
    const response = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        content: 'This is a test comment',
        resourceType: 'task',
        resourceId: taskId,
      });

    expect(response.status).toBe(201);
    expect(response.body.comment).toBeDefined();
    expect(response.body.comment.content).toBe('This is a test comment');
  });

  it('should get comments for a resource', async () => {
    const response = await request(app)
      .get(`/api/comments?resourceType=task&resourceId=${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.comments).toBeDefined();
    expect(Array.isArray(response.body.comments)).toBe(true);
  });

  it('should validate comment content is required', async () => {
    const response = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        resourceType: 'task',
        resourceId: taskId,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
  });
});
