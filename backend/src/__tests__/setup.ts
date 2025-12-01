import { beforeAll, afterAll } from 'vitest';
import { testPrisma, disconnectTestDatabase } from './utils/test-helpers';

// Global test setup
beforeAll(async () => {
  // Ensure test database is connected
  await testPrisma.$connect();
});

// Global test teardown
afterAll(async () => {
  // Disconnect from test database
  await disconnectTestDatabase();
});
