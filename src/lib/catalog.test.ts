import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CatalogClient } from "@/lib/catalog";
import { getProductBySlug, listCategories, listProducts } from "@/lib/catalog";

function createCatalogClient(): CatalogClient {
  return {
    category: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    product: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
  } as unknown as CatalogClient;
}

describe("catalog query helpers", () => {
  let client: CatalogClient;

  beforeEach(() => {
    client = createCatalogClient();
  });

  it("lists categories alphabetically", async () => {
    await listCategories(client);

    expect(client.category.findMany).toHaveBeenCalledWith({
      orderBy: [{ name: "asc" }],
    });
  });

  it("lists active products with category data", async () => {
    await listProducts({}, client);

    expect(client.product.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: [{ name: "asc" }],
    });
  });

  it("filters product listing by category slug and stock flag", async () => {
    await listProducts({ categorySlug: "audio", inStockOnly: true }, client);

    expect(client.product.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        category: {
          slug: "audio",
        },
        inStock: true,
      },
      include: {
        category: true,
      },
      orderBy: [{ name: "asc" }],
    });
  });

  it("looks up active products by trimmed slug", async () => {
    await getProductBySlug(" headphones ", client);

    expect(client.product.findFirst).toHaveBeenCalledWith({
      where: {
        slug: "headphones",
        isActive: true,
      },
      include: {
        category: true,
      },
    });
  });

  it("does not query for blank product slugs", async () => {
    const product = await getProductBySlug("  ", client);

    expect(product).toBeNull();
    expect(client.product.findFirst).not.toHaveBeenCalled();
  });
});
