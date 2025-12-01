import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(1000, 'Note is too long'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional(),
  positionX: z.number().int().optional(),
  positionY: z.number().int().optional(),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(1000, 'Note is too long').optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional()
    .nullable(),
  positionX: z.number().int().optional().nullable(),
  positionY: z.number().int().optional().nullable(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
