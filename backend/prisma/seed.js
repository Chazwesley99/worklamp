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
const prisma = new client_1.PrismaClient();
async function main() {
  console.log('Starting database seed...');
  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@worklamp.com';
  const passwordHash = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Admin User',
      authProvider: 'email',
      emailVerified: true,
      emailOptIn: true,
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);
  // Create tenant for admin
  const tenant = await prisma.tenant.upsert({
    where: { id: 'default-tenant' },
    update: {},
    create: {
      id: 'default-tenant',
      name: 'Default Tenant',
      ownerId: adminUser.id,
      subscriptionTier: 'paid',
      maxProjects: 10,
      maxTeamMembers: 10,
    },
  });
  console.log(`Created tenant: ${tenant.name}`);
  // Create tenant membership
  await prisma.tenantMember.upsert({
    where: {
      tenantId_userId: {
        tenantId: tenant.id,
        userId: adminUser.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: adminUser.id,
      role: 'owner',
    },
  });
  console.log('Database seed completed successfully!');
}
main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
