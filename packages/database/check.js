const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5'
    }
  }
});

prisma.$queryRaw`SELECT 1`
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
