import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../utils/encryption';

const prisma = new PrismaClient();

export interface CreateEnvVarInput {
  projectId: string;
  key: string;
  value: string;
  environment: 'development' | 'production';
  createdById: string;
}

export interface UpdateEnvVarInput {
  key?: string;
  value?: string;
  environment?: 'development' | 'production';
}

export interface EnvVarAuditLog {
  id: string;
  envVarId: string;
  action: 'created' | 'updated' | 'deleted';
  userId: string;
  userName: string;
  changes?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Get all environment variables for a project
 * Values are decrypted before returning
 */
export async function getEnvVarsByProject(projectId: string) {
  const envVars = await prisma.envVar.findMany({
    where: { projectId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ environment: 'asc' }, { key: 'asc' }],
  });

  // Decrypt values before returning
  return envVars.map((envVar) => ({
    ...envVar,
    value: decrypt(envVar.value),
  }));
}

/**
 * Get a single environment variable by ID
 * Value is decrypted before returning
 */
export async function getEnvVarById(id: string) {
  const envVar = await prisma.envVar.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!envVar) {
    return null;
  }

  return {
    ...envVar,
    value: decrypt(envVar.value),
  };
}

/**
 * Create a new environment variable
 * Value is encrypted before storing
 */
export async function createEnvVar(data: CreateEnvVarInput) {
  // Encrypt the value before storing
  const encryptedValue = encrypt(data.value);

  const envVar = await prisma.envVar.create({
    data: {
      projectId: data.projectId,
      key: data.key,
      value: encryptedValue,
      environment: data.environment,
      createdById: data.createdById,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Log the creation
  console.log(`[AUDIT] EnvVar created: ${envVar.id} by user ${data.createdById}`);

  return {
    ...envVar,
    value: data.value, // Return decrypted value
  };
}

/**
 * Update an environment variable
 * Value is encrypted if provided
 */
export async function updateEnvVar(id: string, data: UpdateEnvVarInput, userId: string) {
  // Get the existing env var for audit logging
  const existingEnvVar = await prisma.envVar.findUnique({
    where: { id },
  });

  if (!existingEnvVar) {
    throw new Error('Environment variable not found');
  }

  // Prepare update data
  const updateData: Record<string, string> = {};
  const changes: Record<string, { from?: string; to?: string; changed?: boolean }> = {};

  if (data.key !== undefined && data.key !== existingEnvVar.key) {
    updateData.key = data.key;
    changes.key = { from: existingEnvVar.key, to: data.key };
  }

  if (data.value !== undefined) {
    updateData.value = encrypt(data.value);
    changes.value = { changed: true }; // Don't log actual values for security
  }

  if (data.environment !== undefined && data.environment !== existingEnvVar.environment) {
    updateData.environment = data.environment;
    changes.environment = { from: existingEnvVar.environment, to: data.environment };
  }

  const envVar = await prisma.envVar.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Log the update
  console.log(`[AUDIT] EnvVar updated: ${envVar.id} by user ${userId}`, changes);

  return {
    ...envVar,
    value: data.value !== undefined ? data.value : decrypt(envVar.value),
  };
}

/**
 * Delete an environment variable
 */
export async function deleteEnvVar(id: string, userId: string) {
  const envVar = await prisma.envVar.findUnique({
    where: { id },
  });

  if (!envVar) {
    throw new Error('Environment variable not found');
  }

  await prisma.envVar.delete({
    where: { id },
  });

  // Log the deletion
  console.log(`[AUDIT] EnvVar deleted: ${id} by user ${userId}`);

  return { success: true };
}

/**
 * Check if a user has permission to access environment variables
 * Only admin and owner roles can access env vars
 */
export async function canAccessEnvVars(userId: string, projectId: string): Promise<boolean> {
  // Get the project to find the tenant
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { tenantId: true },
  });

  if (!project) {
    return false;
  }

  // Check if user is a member of the tenant with admin or owner role
  const membership = await prisma.tenantMember.findFirst({
    where: {
      userId,
      tenantId: project.tenantId,
      role: {
        in: ['owner', 'admin'],
      },
    },
  });

  return !!membership;
}

/**
 * Verify that a project belongs to a tenant
 */
export async function verifyProjectTenant(projectId: string, tenantId: string): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      tenantId,
    },
  });

  return !!project;
}
