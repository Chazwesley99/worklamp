import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment is too long'),
  resourceType: z.enum(['task', 'bug', 'feature', 'milestone'], {
    errorMap: () => ({ message: 'Invalid resource type' }),
  }),
  resourceId: z.string().uuid('Invalid resource ID'),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment is too long'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
