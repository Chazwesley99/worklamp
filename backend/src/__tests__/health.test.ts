import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { prisma } from '../config/database';

describe('Health Check Endpoint', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return 200 and status ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should include database and redis status', async () => {
    const response = await request(app).get('/health');

    expect(response.body).toHaveProperty('database');
    expect(response.body).toHaveProperty('redis');
  });
});
