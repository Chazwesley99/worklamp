import { z } from 'zod';

export const uploadFileSchema = z.object({
  fileType: z.enum(['requirements', 'design', 'tasks', 'general']),
});

export const generateMilestonesSchema = z.object({
  fileId: z.string().uuid('Invalid file ID'),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type GenerateMilestonesInput = z.infer<typeof generateMilestonesSchema>;
