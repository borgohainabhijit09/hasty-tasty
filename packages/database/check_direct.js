const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres'
    }
  }
});

prisma.$queryRaw`SELECT 1`
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
