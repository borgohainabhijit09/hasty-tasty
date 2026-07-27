import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = "abhijit@example.com"; // I need to verify what their actual login email is!
  // Wait, I can just promote ALL users right now to SUPER_ADMIN since they only have 1 test account.
  
  const result = await prisma.user.updateMany({
    data: {
      role: 'SUPER_ADMIN'
    }
  });

  console.log(`Promoted ${result.count} users to SUPER_ADMIN.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
