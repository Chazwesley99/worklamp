import { z } from 'zod';

export const updateTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required').max(100, 'Tenant name is too long').optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'developer', 'auditor'], {
    errorMap: () => ({ message: 'Role must be admin, developer, or auditor' }),
  }),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'developer', 'auditor'], {
    errorMap: () => ({ message: 'Role must be admin, developer, or auditor' }),
  }),
});

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
