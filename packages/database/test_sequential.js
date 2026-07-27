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
    const product = await prisma.product.findFirst();
    
    console.log('Found user:', user.id, 'product:', product.id);
    
    // Sequential instead of nested
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: 100,
        taxAmount: 10,
        shippingAmount: 5,
        notes: "Test sequential",
      }
    });
    console.log('Created order:', order.id);

    const item = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: 1,
        price: 85
      }
    });
    console.log('Created item:', item.id);

  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
