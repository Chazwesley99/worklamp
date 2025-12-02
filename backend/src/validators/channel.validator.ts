import { z } from 'zod';

export const createChannelSchema = z.object({
  name: z.string().min(1, 'Channel name is required').max(100, 'Channel name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  isPrivate: z.boolean().optional().default(false),
});

export const updateChannelSchema = z.object({
  name: z
    .string()
    .min(1, 'Channel name is required')
    .max(100, 'Channel name is too long')
    .optional(),
  description: z.string().max(500, 'Description is too long').optional().nullable(),
  isPrivate: z.boolean().optional(),
});

export const updateChannelPermissionsSchema = z.object({
  permissions: z.array(
    z.object({
      userId: z.string().uuid('Invalid user ID'),
      canView: z.boolean(),
      canPost: z.boolean(),
    })
  ),
});

export const createMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(5000, 'Message is too long'),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
export type UpdateChannelPermissionsInput = z.infer<typeof updateChannelPermissionsSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
