'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
const client_1 = require('@prisma/client');
const bcrypt = __importStar(require('bcrypt'));
const prisma = new client_1.PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_DEMO,
    },
  },
});
async function main() {
  console.log('Starting demo database seed...');
  // Create demo users
  const passwordHash = await bcrypt.hash('demo123', 12);
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@demo.worklamp.com' },
    update: {},
    create: {
      email: 'manager@demo.worklamp.com',
      passwordHash,
      name: 'Demo Manager',
      authProvider: 'email',
      emailVerified: true,
      emailOptIn: true,
    },
  });
  const developerUser = await prisma.user.upsert({
    where: { email: 'developer@demo.worklamp.com' },
    update: {},
    create: {
      email: 'developer@demo.worklamp.com',
      passwordHash,
      name: 'Demo Developer',
      authProvider: 'email',
      emailVerified: true,
      emailOptIn: true,
    },
  });
  const auditorUser = await prisma.user.upsert({
    where: { email: 'auditor@demo.worklamp.com' },
    update: {},
    create: {
      email: 'auditor@demo.worklamp.com',
      passwordHash,
      name: 'Demo Auditor',
      authProvider: 'email',
      emailVerified: true,
      emailOptIn: true,
    },
  });
  console.log('Created demo users');
  // Create demo tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant' },
    update: {},
    create: {
      id: 'demo-tenant',
      name: 'Demo Company',
      ownerId: managerUser.id,
      subscriptionTier: 'paid',
      maxProjects: 5,
      maxTeamMembers: 10,
    },
  });
  console.log('Created demo tenant');
  // Create tenant memberships
  await prisma.tenantMember.upsert({
    where: {
      tenantId_userId: {
        tenantId: demoTenant.id,
        userId: managerUser.id,
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: managerUser.id,
      role: 'owner',
    },
  });
  await prisma.tenantMember.upsert({
    where: {
      tenantId_userId: {
        tenantId: demoTenant.id,
        userId: developerUser.id,
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: developerUser.id,
      role: 'developer',
    },
  });
  await prisma.tenantMember.upsert({
    where: {
      tenantId_userId: {
        tenantId: demoTenant.id,
        userId: auditorUser.id,
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: auditorUser.id,
      role: 'auditor',
    },
  });
  console.log('Created tenant memberships');
  // Create demo project
  const demoProject = await prisma.project.upsert({
    where: { id: 'demo-project' },
    update: {},
    create: {
      id: 'demo-project',
      tenantId: demoTenant.id,
      name: 'Demo Project',
      description: 'A sample project to explore Worklamp features',
      status: 'active',
      publicBugTracking: true,
      publicFeatureRequests: true,
    },
  });
  console.log('Created demo project');
  // Create sample milestone
  const milestone = await prisma.milestone.create({
    data: {
      projectId: demoProject.id,
      name: 'Version 1.0',
      description: 'Initial release milestone',
      estimatedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'in-progress',
      order: 1,
    },
  });
  console.log('Created sample milestone');
  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        projectId: demoProject.id,
        milestoneId: milestone.id,
        title: 'Set up development environment',
        description: 'Configure local development environment with all necessary tools',
        category: 'Setup',
        priority: 1,
        status: 'done',
        createdById: managerUser.id,
      },
      {
        projectId: demoProject.id,
        milestoneId: milestone.id,
        title: 'Implement user authentication',
        description: 'Add login and registration functionality',
        category: 'Backend',
        priority: 2,
        status: 'in-progress',
        createdById: managerUser.id,
      },
      {
        projectId: demoProject.id,
        milestoneId: milestone.id,
        title: 'Design dashboard UI',
        description: 'Create mockups and implement dashboard interface',
        category: 'Frontend',
        priority: 3,
        status: 'todo',
        createdById: managerUser.id,
      },
    ],
  });
  console.log('Created sample tasks');
  // Create sample bugs
  await prisma.bug.createMany({
    data: [
      {
        projectId: demoProject.id,
        title: 'Login button not responsive on mobile',
        description: 'The login button is difficult to tap on mobile devices',
        priority: 1,
        status: 'open',
        votes: 5,
        createdById: developerUser.id,
      },
      {
        projectId: demoProject.id,
        title: 'Dashboard loads slowly with many tasks',
        description: 'Performance degrades when displaying 100+ tasks',
        priority: 2,
        status: 'in-progress',
        votes: 3,
        createdById: developerUser.id,
      },
    ],
  });
  console.log('Created sample bugs');
  // Create sample feature requests
  await prisma.featureRequest.createMany({
    data: [
      {
        projectId: demoProject.id,
        title: 'Dark mode support',
        description: 'Add a dark theme option for better visibility in low light',
        priority: 1,
        status: 'planned',
        votes: 12,
        createdById: auditorUser.id,
      },
      {
        projectId: demoProject.id,
        title: 'Export tasks to CSV',
        description: 'Allow users to export their task list as a CSV file',
        priority: 2,
        status: 'proposed',
        votes: 7,
        createdById: auditorUser.id,
      },
    ],
  });
  console.log('Created sample feature requests');
  console.log('Demo database seed completed successfully!');
  console.log('\nDemo Credentials:');
  console.log('Manager: manager@demo.worklamp.com / demo123');
  console.log('Developer: developer@demo.worklamp.com / demo123');
  console.log('Auditor: auditor@demo.worklamp.com / demo123');
}
main()
  .catch((e) => {
    console.error('Error seeding demo database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
