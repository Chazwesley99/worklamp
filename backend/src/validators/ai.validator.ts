import { z } from 'zod';

/**
 * Validator for analyzing a bug
 */
export const analyzeBugSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  url: z.string().url('Invalid URL').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

/**
 * Validator for generating feature specification
 */
export const generateFeatureSpecSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

/**
 * Validator for generating AI agent prompt
 */
export const generatePromptSchema = z.object({
  type: z.enum(['bug', 'feature'], {
    required_error: 'Type is required',
    invalid_type_error: 'Type must be either "bug" or "feature"',
  }),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  context: z.string().optional(),
});

export type AnalyzeBugInput = z.infer<typeof analyzeBugSchema>;
export type GenerateFeatureSpecInput = z.infer<typeof generateFeatureSpecSchema>;
export type GeneratePromptInput = z.infer<typeof generatePromptSchema>;
