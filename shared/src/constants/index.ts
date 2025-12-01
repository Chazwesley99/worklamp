// Shared constants

export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  DEVELOPER: 'developer',
  AUDITOR: 'auditor',
} as const;

export const AUTH_PROVIDERS = {
  EMAIL: 'email',
  GOOGLE: 'google',
} as const;

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PAID: 'paid',
} as const;

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
} as const;

export const BUG_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const FEATURE_STATUS = {
  PROPOSED: 'proposed',
  PLANNED: 'planned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;

export const MILESTONE_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const;
