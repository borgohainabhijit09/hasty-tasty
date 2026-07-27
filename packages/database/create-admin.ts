import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@hastytasty.com' },
    update: {
      password,
      role: 'SUPER_ADMIN',
    },
    create: {
      email: 'admin@hastytasty.com',
      name: 'Admin',
      password,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Admin user upserted:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
