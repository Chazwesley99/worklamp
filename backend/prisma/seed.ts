import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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
