const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5'
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const user = await prisma.user.findFirst();
    const product = await prisma.product.findFirst();
    
    console.log('Found user:', user?.id, 'product:', product?.id);
    
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: 100,
        taxAmount: 10,
        shippingAmount: 5,
        notes: "Test adapter",
        items: {
          create: [{
            productId: product.id,
            quantity: 1,
            price: 85
          }]
        }
      }
    });
    console.log('Created order:', order.id);
  } catch (error) {
    console.error('Failed to create order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
