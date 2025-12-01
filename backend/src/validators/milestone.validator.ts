import { z } from 'zod';

export const createMilestoneSchema = z.object({
  name: z.string().min(1, 'Milestone name is required').max(100, 'Milestone name is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  estimatedCompletionDate: z.string().datetime('Invalid date format'),
  status: z.enum(['planned', 'in-progress', 'completed']).optional().default('planned'),
  order: z.number().int().min(0).optional().default(0),
});

export const updateMilestoneSchema = z.object({
  name: z
    .string()
    .min(1, 'Milestone name is required')
    .max(100, 'Milestone name is too long')
    .optional(),
  description: z.string().max(1000, 'Description is too long').optional().nullable(),
  estimatedCompletionDate: z.string().datetime('Invalid date format').optional(),
  actualCompletionDate: z.string().datetime('Invalid date format').optional().nullable(),
  status: z.enum(['planned', 'in-progress', 'completed']).optional(),
  order: z.number().int().min(0).optional(),
});

export const lockMilestoneSchema = z.object({
  // No body needed, but we validate the request
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type LockMilestoneInput = z.infer<typeof lockMilestoneSchema>;
