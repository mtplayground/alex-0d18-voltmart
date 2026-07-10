import { PrismaClient } from "@prisma/client";

import { seedCategories } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  for (const category of seedCategories) {
    const savedCategory = await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        description: category.description,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });

    for (const product of category.products) {
      await prisma.product.upsert({
        where: {
          slug: product.slug,
        },
        update: {
          categoryId: savedCategory.id,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          imageKeys: product.imageKeys,
          inStock: product.inStock,
          isActive: true,
        },
        create: {
          categoryId: savedCategory.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceCents: product.priceCents,
          imageKeys: product.imageKeys,
          inStock: product.inStock,
          isActive: true,
        },
      });
    }
  }

  const [categoryCount, productCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
  ]);

  console.log(`Seeded electronics catalog: ${categoryCount} categories, ${productCount} products.`);
}

main()
  .catch((error: unknown) => {
    console.error("Failed to seed electronics catalog.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
