import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  publicBugTracking: z.boolean().optional().default(false),
  publicFeatureRequests: z.boolean().optional().default(false),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name is too long')
    .optional(),
  description: z.string().max(500, 'Description is too long').optional().nullable(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
  publicBugTracking: z.boolean().optional(),
  publicFeatureRequests: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
