import { UserEnvVar } from '@prisma/client';
import { encrypt, decrypt } from '../utils/encryption';
import { prisma } from '../config/database';

export interface CreateUserEnvVarInput {
  userId: string;
  key: string;
  value: string;
}

export interface UpdateUserEnvVarInput {
  key?: string;
  value?: string;
}

export interface UserEnvVarWithDecryptedValue extends Omit<UserEnvVar, 'value'> {
  value: string;
}

/**
 * Get all environment variables for a user
 * Values are decrypted before returning
 */
export async function getUserEnvVarsByUser(
  userId: string
): Promise<UserEnvVarWithDecryptedValue[]> {
  const envVars = await prisma.userEnvVar.findMany({
    where: { userId },
    orderBy: { key: 'asc' },
  });

  // Decrypt values before returning
  return envVars.map(
    (envVar: UserEnvVar): UserEnvVarWithDecryptedValue => ({
      ...envVar,
      value: decrypt(envVar.value),
    })
  );
}

/**
 * Get a single user environment variable by ID
 * Value is decrypted before returning
 */
export async function getUserEnvVarById(id: string): Promise<UserEnvVarWithDecryptedValue | null> {
  const envVar = await prisma.userEnvVar.findUnique({
    where: { id },
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
 * Create a new user environment variable
 * Value is encrypted before storing
 */
export async function createUserEnvVar(
  data: CreateUserEnvVarInput
): Promise<UserEnvVarWithDecryptedValue> {
  // Encrypt the value before storing
  const encryptedValue = encrypt(data.value);

  const envVar = await prisma.userEnvVar.create({
    data: {
      userId: data.userId,
      key: data.key,
      value: encryptedValue,
    },
  });

  // Log the creation
  console.log(`[AUDIT] UserEnvVar created: ${envVar.id} by user ${data.userId}`);

  return {
    ...envVar,
    value: data.value, // Return decrypted value
  };
}

/**
 * Update a user environment variable
 * Value is encrypted if provided
 */
export async function updateUserEnvVar(
  id: string,
  data: UpdateUserEnvVarInput,
  userId: string
): Promise<UserEnvVarWithDecryptedValue> {
  // Get the existing env var for audit logging
  const existingEnvVar = await prisma.userEnvVar.findUnique({
    where: { id },
  });

  if (!existingEnvVar) {
    throw new Error('User environment variable not found');
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

  const envVar = await prisma.userEnvVar.update({
    where: { id },
    data: updateData,
  });

  // Log the update
  console.log(`[AUDIT] UserEnvVar updated: ${envVar.id} by user ${userId}`, changes);

  return {
    ...envVar,
    value: data.value !== undefined ? data.value : decrypt(envVar.value),
  };
}

/**
 * Delete a user environment variable
 */
export async function deleteUserEnvVar(id: string, userId: string): Promise<{ success: boolean }> {
  const envVar = await prisma.userEnvVar.findUnique({
    where: { id },
  });

  if (!envVar) {
    throw new Error('User environment variable not found');
  }

  await prisma.userEnvVar.delete({
    where: { id },
  });

  // Log the deletion
  console.log(`[AUDIT] UserEnvVar deleted: ${id} by user ${userId}`);

  return { success: true };
}
