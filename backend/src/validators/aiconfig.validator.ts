import { z } from 'zod';

/**
 * Validator for creating/updating AI configuration
 */
export const createAIConfigSchema = z.object({
  provider: z.enum(['openai', 'google', 'platform'], {
    required_error: 'Provider is required',
    invalid_type_error: 'Provider must be one of: openai, google, platform',
  }),
  apiKey: z
    .string()
    .min(1, 'API key is required when not using platform provider')
    .optional()
    .nullable(),
  isEnabled: z.boolean().default(true),
});

export const updateAIConfigSchema = z.object({
  provider: z.enum(['openai', 'google', 'platform']).optional(),
  apiKey: z.string().min(1).optional().nullable(),
  isEnabled: z.boolean().optional(),
});

export type CreateAIConfigInput = z.infer<typeof createAIConfigSchema>;
export type UpdateAIConfigInput = z.infer<typeof updateAIConfigSchema>;
