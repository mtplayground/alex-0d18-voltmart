import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAdminProduct,
  deleteAdminProduct,
  formatPriceInput,
  type AdminProductClient,
  updateAdminProduct,
  valuesFromProduct,
} from "@/lib/admin-products";

const category = {
  id: "category_1",
  name: "Phones",
  slug: "phones",
  description: null,
  createdAt: new Date("2026-07-10T12:00:00Z"),
  updatedAt: new Date("2026-07-10T12:00:00Z"),
};

function createFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values = {
    categoryId: category.id,
    name: "Compact 5G Phone",
    slug: "compact-5g-phone",
    description: "A compact phone with a bright display and durable shell.",
    price: "499.00",
    imageKeys: "/placeholders/catalog/phones.svg\n/placeholders/catalog/accessories.svg",
    inStock: "on",
    isActive: "on",
    ...overrides,
  };

  Object.entries(values).forEach(([key, value]) => {
    if (value) {
      formData.set(key, value);
    }
  });

  return formData;
}

function createAdminProductClient(): AdminProductClient {
  return {
    category: {
      findMany: vi.fn().mockResolvedValue([category]),
    },
    product: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "product_1" }),
      update: vi.fn().mockResolvedValue({ id: "product_1" }),
    },
  } as unknown as AdminProductClient;
}

describe("admin product helpers", () => {
  let client: ReturnType<typeof createAdminProductClient>;

  beforeEach(() => {
    client = createAdminProductClient();
  });

  it("creates products with normalized form values", async () => {
    await expect(createAdminProduct(createFormData(), client)).resolves.toMatchObject({
      status: "success",
      message: "Product created",
    });

    expect(client.product.create).toHaveBeenCalledWith({
      data: {
        categoryId: category.id,
        name: "Compact 5G Phone",
        slug: "compact-5g-phone",
        description: "A compact phone with a bright display and durable shell.",
        priceCents: 49900,
        imageKeys: ["/placeholders/catalog/phones.svg", "/placeholders/catalog/accessories.svg"],
        inStock: true,
        isActive: true,
      },
    });
  });

  it("generates a slug from the name when the slug field is blank", async () => {
    await createAdminProduct(createFormData({ slug: "" }), client);

    expect(client.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "compact-5g-phone",
        }),
      }),
    );
  });

  it("returns validation errors without writing invalid products", async () => {
    await expect(
      createAdminProduct(
        createFormData({
          categoryId: "",
          name: "A",
          description: "short",
          price: "12.999",
        }),
        client,
      ),
    ).resolves.toMatchObject({
      status: "error",
      message: "Review the highlighted fields",
      errors: {
        categoryId: "Category is required",
        name: "Name must be at least 2 characters",
        description: "Description must be at least 10 characters",
        price: "Enter a price greater than 0 with up to 2 decimals",
      },
    });

    expect(client.product.create).not.toHaveBeenCalled();
  });

  it("maps duplicate slugs to a form error", async () => {
    vi.mocked(client.product.create).mockRejectedValue({ code: "P2002" });

    await expect(createAdminProduct(createFormData(), client)).resolves.toMatchObject({
      status: "error",
      message: "Product slug already exists",
      errors: {
        slug: "Slug must be unique",
      },
    });
  });

  it("updates products with parsed price, booleans, and image keys", async () => {
    await expect(
      updateAdminProduct(
        "product_1",
        createFormData({
          price: "25.5",
          imageKeys: " image-a.svg, image-b.svg ",
          inStock: "",
        }),
        client,
      ),
    ).resolves.toMatchObject({
      status: "success",
      message: "Product updated",
    });

    expect(client.product.update).toHaveBeenCalledWith({
      where: {
        id: "product_1",
      },
      data: expect.objectContaining({
        priceCents: 2550,
        imageKeys: ["image-a.svg", "image-b.svg"],
        inStock: false,
        isActive: true,
      }),
    });
  });

  it("soft deletes products by marking them inactive", async () => {
    await deleteAdminProduct("product_1", client);

    expect(client.product.update).toHaveBeenCalledWith({
      where: {
        id: "product_1",
      },
      data: {
        isActive: false,
      },
    });
  });

  it("formats existing products as form values", () => {
    expect(
      valuesFromProduct({
        id: "product_1",
        categoryId: category.id,
        category,
        name: "Compact 5G Phone",
        slug: "compact-5g-phone",
        description: "A compact phone with a bright display and durable shell.",
        priceCents: 49900,
        imageKeys: ["a.svg", "b.svg"],
        inStock: true,
        isActive: false,
        createdAt: new Date("2026-07-10T12:00:00Z"),
        updatedAt: new Date("2026-07-10T12:00:00Z"),
      }),
    ).toMatchObject({
      categoryId: category.id,
      price: "499.00",
      imageKeys: "a.svg\nb.svg",
      inStock: "on",
      isActive: "",
    });
    expect(formatPriceInput(2550)).toBe("25.50");
  });
});
