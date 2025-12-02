import { z } from 'zod';

export const createFeatureSchema = z.object({
  title: z.string().min(1, 'Feature title is required').max(200, 'Feature title is too long'),
  description: z
    .string()
    .min(1, 'Feature description is required')
    .max(5000, 'Description is too long'),
  priority: z.number().int().min(0).max(100).optional().default(0),
  status: z
    .enum(['proposed', 'planned', 'in-progress', 'completed', 'rejected'])
    .optional()
    .default('proposed'),
  ownerId: z.string().uuid('Invalid owner ID').optional().nullable(),
  assignedUserIds: z.array(z.string().uuid('Invalid user ID')).optional().default([]),
});

export const updateFeatureSchema = z.object({
  title: z
    .string()
    .min(1, 'Feature title is required')
    .max(200, 'Feature title is too long')
    .optional(),
  description: z
    .string()
    .min(1, 'Feature description is required')
    .max(5000, 'Description is too long')
    .optional(),
  priority: z.number().int().min(0).max(100).optional(),
  status: z.enum(['proposed', 'planned', 'in-progress', 'completed', 'rejected']).optional(),
  ownerId: z.string().uuid('Invalid owner ID').optional().nullable(),
});

export const assignFeatureSchema = z.object({
  userIds: z.array(z.string().uuid('Invalid user ID')).min(1, 'At least one user must be assigned'),
});

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>;
export type AssignFeatureInput = z.infer<typeof assignFeatureSchema>;
