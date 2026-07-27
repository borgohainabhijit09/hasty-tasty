const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'
    }
  }
});

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
        notes: "Test direct session pooler",
      }
    });
    console.log('Created order:', order.id);
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
