const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:Advikrini%401408@db.xdxadyrdkppxxvizzloq.supabase.co:5432/postgres'
    }
  }
});

prisma.$queryRaw`SELECT 1`
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
