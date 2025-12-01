import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  category: z.string().max(50, 'Category is too long').optional(),
  priority: z.number().int().min(0).max(100).optional().default(0),
  status: z.enum(['todo', 'in-progress', 'done']).optional().default('todo'),
  milestoneId: z.string().uuid('Invalid milestone ID').optional().nullable(),
  ownerId: z.string().uuid('Invalid owner ID').optional().nullable(),
  assignedUserIds: z.array(z.string().uuid('Invalid user ID')).optional().default([]),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title is too long').optional(),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  category: z.string().max(50, 'Category is too long').optional().nullable(),
  priority: z.number().int().min(0).max(100).optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  milestoneId: z.string().uuid('Invalid milestone ID').optional().nullable(),
  ownerId: z.string().uuid('Invalid owner ID').optional().nullable(),
});

export const assignTaskSchema = z.object({
  userIds: z.array(z.string().uuid('Invalid user ID')).min(1, 'At least one user must be assigned'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
