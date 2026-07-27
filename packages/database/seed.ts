import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Categories
  const categoryCakes = await prisma.category.upsert({
    where: { slug: 'cakes' },
    update: {},
    create: {
      name: 'Cakes',
      slug: 'cakes',
      description: 'Freshly baked cakes for all occasions',
    },
  });

  const categoryCookies = await prisma.category.upsert({
    where: { slug: 'cookies' },
    update: {},
    create: {
      name: 'Cookies',
      slug: 'cookies',
      description: 'Crunchy and sweet cookies',
    },
  });

  // Create B2C Products
  await prisma.product.upsert({
    where: { slug: 'chocolate-truffle-cake' },
    update: {},
    create: {
      name: 'Chocolate Truffle Cake',
      slug: 'chocolate-truffle-cake',
      description: 'Rich chocolate cake loaded with truffle.',
      basePrice: 1199,
      categoryId: categoryCakes.id,
      images: {
        create: { url: '/images/hero-cake.png', isPrimary: true }
      }
    },
  });

  await prisma.product.upsert({
    where: { slug: 'strawberry-pastry' },
    update: {},
    create: {
      name: 'Strawberry Pastry',
      slug: 'strawberry-pastry',
      description: 'Fresh strawberry layered pastry.',
      basePrice: 249,
      categoryId: categoryCakes.id,
      images: {
        create: { url: '/images/hero-cake.png', isPrimary: true }
      }
    },
  });

  // Create B2B Products
  await prisma.product.upsert({
    where: { slug: 'bulk-chocolate-cookies' },
    update: {},
    create: {
      name: 'Bulk Chocolate Cookies (Wholesale)',
      slug: 'bulk-chocolate-cookies',
      description: 'Wholesale pack of our famous chocolate cookies.',
      basePrice: 5000,
      b2bPrice: 4000,
      categoryId: categoryCookies.id,
      images: {
        create: { url: '/images/pastries-new.png', isPrimary: true }
      }
    },
  });

  await prisma.product.upsert({
    where: { slug: 'wholesale-fruit-cake' },
    update: {},
    create: {
      name: 'Wholesale Premium Fruit Cake',
      slug: 'wholesale-fruit-cake',
      description: 'Large batch premium fruit cakes for events.',
      basePrice: 8000,
      b2bPrice: 6500,
      categoryId: categoryCakes.id,
      images: {
        create: { url: '/images/hero-cake.png', isPrimary: true }
      }
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
