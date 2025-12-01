import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../index';
import { cleanupTestData } from '../utils/test-helpers';

describe('API Integration Tests', () => {
  beforeEach(async () => {
    // Setup before each test
  });

  afterEach(async () => {
    // Cleanup after each test
    await cleanupTestData();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  // Additional integration tests will be added as features are implemented
});
