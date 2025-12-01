import { z } from 'zod';

export const createEnvVarSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .max(100, 'Key is too long')
    .regex(/^[A-Z_][A-Z0-9_]*$/, 'Key must be uppercase with underscores'),
  value: z.string().min(1, 'Value is required').max(5000, 'Value is too long'),
  environment: z.enum(['development', 'production'], {
    errorMap: () => ({ message: 'Environment must be development or production' }),
  }),
});

export const updateEnvVarSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .max(100, 'Key is too long')
    .regex(/^[A-Z_][A-Z0-9_]*$/, 'Key must be uppercase with underscores')
    .optional(),
  value: z.string().min(1, 'Value is required').max(5000, 'Value is too long').optional(),
  environment: z
    .enum(['development', 'production'], {
      errorMap: () => ({ message: 'Environment must be development or production' }),
    })
    .optional(),
});

export type CreateEnvVarInput = z.infer<typeof createEnvVarSchema>;
export type UpdateEnvVarInput = z.infer<typeof updateEnvVarSchema>;
