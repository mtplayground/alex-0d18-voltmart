import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/db";

export type CatalogClient = Pick<PrismaClient, "category" | "product">;

const productWithCategory = {
  category: true,
} satisfies Prisma.ProductInclude;

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: typeof productWithCategory;
}>;

export type ListProductsOptions = Readonly<{
  categorySlug?: string;
  inStockOnly?: boolean;
}>;

export async function listCategories(client: CatalogClient = prisma) {
  return client.category.findMany({
    orderBy: [{ name: "asc" }],
  });
}

export async function listProducts(
  options: ListProductsOptions = {},
  client: CatalogClient = prisma,
): Promise<ProductWithCategory[]> {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (options.categorySlug) {
    where.category = {
      slug: options.categorySlug,
    };
  }

  if (options.inStockOnly) {
    where.inStock = true;
  }

  return client.product.findMany({
    where,
    include: productWithCategory,
    orderBy: [{ name: "asc" }],
  });
}

export async function getProductBySlug(
  slug: string,
  client: CatalogClient = prisma,
): Promise<ProductWithCategory | null> {
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return null;
  }

  return client.product.findFirst({
    where: {
      slug: normalizedSlug,
      isActive: true,
    },
    include: productWithCategory,
  });
}
