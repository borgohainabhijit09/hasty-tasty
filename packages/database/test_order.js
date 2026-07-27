const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5'
    }
  }
});

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }
    const product = await prisma.product.findFirst();
    if (!product) {
      console.log('No product found');
      return;
    }
    
    console.log('Found user:', user.id, 'product:', product.id);
    
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: 100,
        taxAmount: 10,
        shippingAmount: 5,
        notes: "Test",
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
