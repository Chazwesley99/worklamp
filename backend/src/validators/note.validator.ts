import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(1000, 'Note content is too long'),
  color: z.string().max(20, 'Color value is too long').optional().nullable(),
  positionX: z.number().int().optional().nullable(),
  positionY: z.number().int().optional().nullable(),
});

export const updateNoteSchema = z.object({
  content: z
    .string()
    .min(1, 'Note content is required')
    .max(1000, 'Note content is too long')
    .optional(),
  color: z.string().max(20, 'Color value is too long').optional().nullable(),
  positionX: z.number().int().optional().nullable(),
  positionY: z.number().int().optional().nullable(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
