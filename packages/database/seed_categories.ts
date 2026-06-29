import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const b2cCategories = [
  "Cakes, Pastries & Desserts",
  "Snacks & Chocolates",
  "Confectionery",
  "Beverages",
  "Frozen Foods",
  "Gift Hampers",
  "Party & Decoration Items",
  "Home Maker Products",
  "Baking Supplies & Equipment"
];

const b2bCategories = [
  "Bakery Supplies",
  "Restaurant Supplies",
  "Retail Store Supplies",
  "Decoration Products",
  "Frozen Products",
  "Bulk Purchase / Annual Contracts"
];

async function main() {
  console.log('Seeding categories...');

  for (const name of b2cCategories) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await prisma.category.upsert({
      where: { slug },
      update: { isB2C: true },
      create: { name, slug, isB2C: true, isB2B: false }
    });
  }

  for (const name of b2bCategories) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await prisma.category.upsert({
      where: { slug },
      update: { isB2B: true },
      create: { name, slug, isB2C: false, isB2B: true }
    });
  }

  console.log('Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
