import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../config/database';
import { tenantService } from '../services/tenant.service';
import { hashPassword } from '../utils/password';

describe('Tenant Service', () => {
  let testUserId: string;
  let testTenantId: string;
  let testUser2Id: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'tenant-test@example.com',
        passwordHash: await hashPassword('password123'),
        name: 'Tenant Test User',
        authProvider: 'email',
        emailVerified: true,
      },
    });
    testUserId = user.id;

    // Create test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Workspace',
        ownerId: testUserId,
        subscriptionTier: 'free',
        maxProjects: 1,
        maxTeamMembers: 1,
      },
    });
    testTenantId = tenant.id;

    // Add user as tenant member
    await prisma.tenantMember.create({
      data: {
        tenantId: testTenantId,
        userId: testUserId,
        role: 'owner',
      },
    });

    // Create second test user
    const user2 = await prisma.user.create({
      data: {
        email: 'tenant-test2@example.com',
        passwordHash: await hashPassword('password123'),
        name: 'Tenant Test User 2',
        authProvider: 'email',
        emailVerified: true,
      },
    });
    testUser2Id = user2.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.tenantMember.deleteMany({
      where: { tenantId: testTenantId },
    });
    await prisma.tenant.delete({
      where: { id: testTenantId },
    });
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [testUserId, testUser2Id],
        },
      },
    });
  });

  it('should get tenant by ID', async () => {
    const tenant = await tenantService.getTenantById(testTenantId);

    expect(tenant).toBeDefined();
    expect(tenant.id).toBe(testTenantId);
    expect(tenant.name).toBe('Test Workspace');
    expect(tenant.subscriptionTier).toBe('free');
  });

  it('should check if tenant can create project', async () => {
    const canCreate = await tenantService.canCreateProject(testTenantId);

    // Free tier has max 1 project, and we haven't created any yet
    expect(canCreate).toBe(true);
  });

  it('should check if tenant can add team member', async () => {
    const canAdd = await tenantService.canAddTeamMember(testTenantId);

    // Free tier has max 1 member, and we already have 1 (owner)
    expect(canAdd).toBe(false);
  });

  it('should check if user is owner', async () => {
    const isOwner = await tenantService.isOwner(testTenantId, testUserId);
    expect(isOwner).toBe(true);

    const isNotOwner = await tenantService.isOwner(testTenantId, testUser2Id);
    expect(isNotOwner).toBe(false);
  });

  it('should get user role in tenant', async () => {
    const role = await tenantService.getUserRole(testTenantId, testUserId);
    expect(role).toBe('owner');

    const noRole = await tenantService.getUserRole(testTenantId, testUser2Id);
    expect(noRole).toBeNull();
  });

  it('should update tenant name', async () => {
    const updatedTenant = await tenantService.updateTenant(testTenantId, testUserId, {
      name: 'Updated Workspace',
    });

    expect(updatedTenant.name).toBe('Updated Workspace');
  });

  it('should not allow non-owner to update tenant', async () => {
    await expect(
      tenantService.updateTenant(testTenantId, testUser2Id, { name: 'Hacked' })
    ).rejects.toThrow('FORBIDDEN_NOT_OWNER');
  });
});
