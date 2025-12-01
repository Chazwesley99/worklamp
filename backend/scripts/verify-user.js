/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyUser() {
  try {
    const user = await prisma.user.update({
      where: { email: 'wes@thisportal.com' },
      data: { emailVerified: true },
    });

    console.log('✅ User verified successfully:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email Verified: ${user.emailVerified}`);
  } catch (error) {
    console.error('❌ Error verifying user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUser();
