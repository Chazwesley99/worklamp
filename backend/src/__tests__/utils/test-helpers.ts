import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Test database client
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    },
  },
});

// Helper to create a test user
export async function createTestUser(overrides: Record<string, unknown> = {}) {
  const passwordHash = await bcrypt.hash('test123', 12);

  return testPrisma.user.create({
    data: {
      email: (overrides.email as string) || `test-${Date.now()}@example.com`,
      passwordHash,
      name: (overrides.name as string) || 'Test User',
      authProvider: (overrides.authProvider as string) || 'email',
      emailVerified: (overrides.emailVerified as boolean) ?? true,
      emailOptIn: (overrides.emailOptIn as boolean) ?? false,
      ...overrides,
    },
  });
}

// Helper to create a test tenant
export async function createTestTenant(ownerId: string, overrides: Record<string, unknown> = {}) {
  return testPrisma.tenant.create({
    data: {
      name: (overrides.name as string) || 'Test Tenant',
      ownerId,
      subscriptionTier: (overrides.subscriptionTier as string) || 'free',
      maxProjects: (overrides.maxProjects as number) || 1,
      maxTeamMembers: (overrides.maxTeamMembers as number) || 1,
      ...overrides,
    },
  });
}

// Helper to create a test project
export async function createTestProject(tenantId: string, overrides: Record<string, unknown> = {}) {
  return testPrisma.project.create({
    data: {
      tenantId,
      name: (overrides.name as string) || 'Test Project',
      description: (overrides.description as string) || 'A test project',
      status: (overrides.status as string) || 'active',
      publicBugTracking: (overrides.publicBugTracking as boolean) ?? false,
      publicFeatureRequests: (overrides.publicFeatureRequests as boolean) ?? false,
      ...overrides,
    },
  });
}

// Helper to clean up test data
export async function cleanupTestData() {
  // Delete in order to respect foreign key constraints
  await testPrisma.taskAssignment.deleteMany();
  await testPrisma.task.deleteMany();
  await testPrisma.bugAssignment.deleteMany();
  await testPrisma.bugVote.deleteMany();
  await testPrisma.bug.deleteMany();
  await testPrisma.featureAssignment.deleteMany();
  await testPrisma.featureVote.deleteMany();
  await testPrisma.featureRequest.deleteMany();
  await testPrisma.comment.deleteMany();
  await testPrisma.channelPermission.deleteMany();
  await testPrisma.message.deleteMany();
  await testPrisma.channel.deleteMany();
  await testPrisma.note.deleteMany();
  await testPrisma.envVar.deleteMany();
  await testPrisma.notification.deleteMany();
  await testPrisma.changeOrder.deleteMany();
  await testPrisma.milestone.deleteMany();
  await testPrisma.project.deleteMany();
  await testPrisma.aIConfig.deleteMany();
  await testPrisma.tenantMember.deleteMany();
  await testPrisma.tenant.deleteMany();
  await testPrisma.user.deleteMany();
}

// Disconnect test database
export async function disconnectTestDatabase() {
  await testPrisma.$disconnect();
}
