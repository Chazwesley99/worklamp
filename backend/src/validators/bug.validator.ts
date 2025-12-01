import { z } from 'zod';

export const createBugSchema = z.object({
  title: z.string().min(1, 'Bug title is required').max(200, 'Bug title is too long'),
  description: z
    .string()
    .min(1, 'Bug description is required')
    .max(5000, 'Description is too long'),
  url: z.string().url('Invalid URL').max(500, 'URL is too long').optional().nullable(),
  priority: z.number().int().min(0).max(100).optional().default(0),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']).optional().default('open'),
  ownerId: z.string().uuid('Invalid owner ID').optional().nullable(),
  assignedUserIds: z.array(z.string().uuid('Invalid user ID')).optional().default([]),
});

export const updateBugSchema = z.object({
  title: z.string().min(1, 'Bug title is required').max(200, 'Bug title is too long').optional(),
  description: z
    .string()
    .min(1, 'Bug description is required')
    .max(5000, 'Description is too long')
    .optional(),
  url: z.string().url('Invalid URL').max(500, 'URL is too long').optional().nullable(),
  priority: z.number().int().min(0).max(100).optional(),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']).optional(),
  ownerId: z.string().uuid('Invalid owner ID').optional().nullable(),
});

export const voteBugSchema = z.object({
  // No body needed for voting, but we validate the request
});

export type CreateBugInput = z.infer<typeof createBugSchema>;
export type UpdateBugInput = z.infer<typeof updateBugSchema>;
export type VoteBugInput = z.infer<typeof voteBugSchema>;
