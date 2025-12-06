import { z } from 'zod';

export const updateUserAdminSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  emailVerified: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
});

export const updateTenantSchema = z.object({
  subscriptionTier: z.enum(['free', 'paid']).optional(),
  maxProjects: z.number().int().min(1).optional(),
  maxTeamMembers: z.number().int().min(1).optional(),
});
