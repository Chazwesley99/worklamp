import { z } from 'zod';

export const createChangeOrderSchema = z.object({
  milestoneId: z.string().uuid('Invalid milestone ID'),
  title: z
    .string()
    .min(1, 'Change order title is required')
    .max(200, 'Change order title is too long'),
  description: z
    .string()
    .min(1, 'Change order description is required')
    .max(2000, 'Description is too long'),
  status: z.enum(['pending', 'approved', 'rejected']).optional().default('pending'),
});

export const updateChangeOrderSchema = z.object({
  title: z
    .string()
    .min(1, 'Change order title is required')
    .max(200, 'Change order title is too long')
    .optional(),
  description: z
    .string()
    .min(1, 'Change order description is required')
    .max(2000, 'Description is too long')
    .optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export type CreateChangeOrderInput = z.infer<typeof createChangeOrderSchema>;
export type UpdateChangeOrderInput = z.infer<typeof updateChangeOrderSchema>;
