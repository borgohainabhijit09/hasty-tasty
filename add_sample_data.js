const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories and products...");

  const categories = [
    { name: "Cakes", slug: "cakes", description: "Delicious premium cakes" },
    { name: "Cookies", slug: "cookies", description: "Freshly baked cookies" },
    { name: "Breads", slug: "breads", description: "Artisanal breads" },
    { name: "Pastries", slug: "pastries", description: "Sweet and savory pastries" },
    { name: "Beverages", slug: "beverages", description: "Refreshing drinks and shakes" }
  ];

  for (const cat of categories) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description
      }
    });
    
    // Add 2 products per category
    for (let i = 1; i <= 2; i++) {
      const productName = `${cat.name.slice(0, -1)} Sample ${i}`;
      const slug = `${cat.slug}-sample-${i}`;
      
      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          categoryId: createdCat.id,
          name: productName,
          slug: slug,
          sku: `${cat.name.substring(0,3).toUpperCase()}${i}00`,
          description: `This is a sample ${productName} for your bakery.`,
          basePrice: 150 + (i * 50),
          stock: 20 + (i * 5),
          isActive: true
        }
      });
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
