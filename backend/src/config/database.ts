import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

// Singleton pattern for Prisma Client
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// AsyncLocalStorage for tenant context
export const tenantContext = new AsyncLocalStorage<{ tenantId: string }>();

// Models that require tenant isolation
const TENANT_ISOLATED_MODELS = [
  'Project',
  'Milestone',
  'Task',
  'TaskAssignment',
  'Bug',
  'BugAssignment',
  'BugVote',
  'FeatureRequest',
  'FeatureAssignment',
  'FeatureVote',
  'Channel',
  'ChannelPermission',
  'Message',
  'EnvVar',
  'ChangeOrder',
];

// Tenant isolation middleware
prisma.$use(async (params, next) => {
  const context = tenantContext.getStore();

  // Skip middleware if no tenant context (e.g., during seeding or system operations)
  // Also skip for non-tenant-isolated models
  if (!context?.tenantId || !params.model || !TENANT_ISOLATED_MODELS.includes(params.model)) {
    return next(params);
  }

  const { tenantId } = context;

  // Handle different operations
  if (params.action === 'findUnique' || params.action === 'findFirst') {
    // Add tenant filter to where clause
    params.args.where = {
      ...params.args.where,
      ...(await getTenantFilter(params.model!, tenantId)),
    };
  } else if (params.action === 'findMany') {
    // Add tenant filter to where clause
    params.args.where = {
      ...params.args.where,
      ...(await getTenantFilter(params.model!, tenantId)),
    };
  } else if (params.action === 'create') {
    // Add tenantId to data for models that have it directly
    if (params.model === 'Project') {
      params.args.data = {
        ...params.args.data,
        tenantId,
      };
    }
    // For other models, we rely on the relation to Project
  } else if (params.action === 'update' || params.action === 'updateMany') {
    // Add tenant filter to where clause
    params.args.where = {
      ...params.args.where,
      ...(await getTenantFilter(params.model!, tenantId)),
    };
  } else if (params.action === 'delete' || params.action === 'deleteMany') {
    // Add tenant filter to where clause
    params.args.where = {
      ...params.args.where,
      ...(await getTenantFilter(params.model!, tenantId)),
    };
  } else if (params.action === 'count') {
    // Add tenant filter to where clause
    params.args.where = {
      ...params.args.where,
      ...(await getTenantFilter(params.model!, tenantId)),
    };
  }

  return next(params);
});

/**
 * Get the appropriate tenant filter for a given model
 */
async function getTenantFilter(model: string, tenantId: string): Promise<any> {
  // Models with direct tenantId
  if (model === 'Project') {
    return { tenantId };
  }

  // Models related through Project
  if (
    ['Milestone', 'Task', 'Bug', 'FeatureRequest', 'Channel', 'EnvVar', 'ChangeOrder'].includes(
      model
    )
  ) {
    return {
      project: {
        tenantId,
      },
    };
  }

  // Models related through their parent entities
  if (model === 'TaskAssignment') {
    return {
      task: {
        project: {
          tenantId,
        },
      },
    };
  }

  if (model === 'BugAssignment' || model === 'BugVote') {
    return {
      bug: {
        project: {
          tenantId,
        },
      },
    };
  }

  if (model === 'FeatureAssignment' || model === 'FeatureVote') {
    return {
      featureRequest: {
        project: {
          tenantId,
        },
      },
    };
  }

  if (model === 'ChannelPermission' || model === 'Message') {
    return {
      channel: {
        project: {
          tenantId,
        },
      },
    };
  }

  // Default: no filter (shouldn't reach here for tenant-isolated models)
  return {};
}

export default prisma;
