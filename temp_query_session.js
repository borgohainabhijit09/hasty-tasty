const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?connection_limit=3"
    }
  }
});

async function main() {
  console.time("session_query");
  try {
    const res = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        pricingTiers: true
      }
    });
    console.log("PRODUCTS FOUND:", res.length);
  } catch (err) {
    console.error("Error querying products:", err);
  } finally {
    console.timeEnd("session_query");
    await prisma.$disconnect();
  }
}

main();
