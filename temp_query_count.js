const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
    }
  }
});

async function main() {
  console.time("select_query");
  try {
    const res = await prisma.$queryRawUnsafe('SELECT * FROM "Product"');
    console.log("SELECT RESULT:", res);
  } catch (err) {
    console.error("Error selecting products:", err);
  } finally {
    console.timeEnd("select_query");
    await prisma.$disconnect();
  }
}

main();
