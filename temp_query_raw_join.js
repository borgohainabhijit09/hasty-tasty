const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5"
    }
  }
});

async function main() {
  console.time("raw_join");
  try {
    const res = await prisma.$queryRawUnsafe(`
      SELECT 
        p.*,
        (
          SELECT json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'description', c.description)
          FROM "Category" c 
          WHERE c.id = p."categoryId"
        ) AS category,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', pi.id, 'productId', pi."productId", 'url', pi.url, 'isPrimary', pi."isPrimary"))
            FROM "ProductImage" pi 
            WHERE pi."productId" = p.id
          ),
          '[]'::json
        ) AS images,
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', pt.id, 'productId', pt."productId", 'minQty', pt."minQty", 'maxQty', pt."maxQty", 'price', pt.price))
            FROM "PricingTier" pt 
            WHERE pt."productId" = p.id
          ),
          '[]'::json
        ) AS "pricingTiers"
      FROM "Product" p
    `);
    console.log("PRODUCTS FOUND:", res.length);
    console.dir(res, { depth: null });
  } catch (err) {
    console.error("Error executing raw join:", err);
  } finally {
    console.timeEnd("raw_join");
    await prisma.$disconnect();
  }
}

main();
