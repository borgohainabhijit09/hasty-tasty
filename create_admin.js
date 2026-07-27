const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@hastytasty.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'SUPER_ADMIN',
      password: hashedPassword
    },
    create: {
      email,
      name: 'Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  });

  console.log('Admin account created/updated successfully:', admin.email, 'Role:', admin.role);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
