import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  addCartItemForSession,
  maxCartItemQuantity,
  removeCartItemForSession,
  type CartActionClient,
  updateCartItemQuantityForSession,
} from "@/lib/cart-actions";

const sessionId = "550e8400-e29b-41d4-a716-446655440000";
const productId = "product_1";
const cartId = "cart_1";

function createCartActionClient(): CartActionClient {
  return {
    product: {
      findFirst: vi.fn().mockResolvedValue({ id: productId, inStock: true }),
    },
    cart: {
      findUnique: vi.fn().mockResolvedValue({ id: cartId, sessionId, items: [] }),
      upsert: vi.fn().mockResolvedValue({ id: cartId, sessionId, items: [] }),
    },
    cartItem: {
      create: vi.fn().mockResolvedValue({ id: "cart_item_1" }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      findUnique: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({ id: "cart_item_1" }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  } as unknown as CartActionClient;
}

describe("cart server action helpers", () => {
  let client: CartActionClient;

  beforeEach(() => {
    client = createCartActionClient();
  });

  it("adds a purchasable product to the current cart", async () => {
    await expect(
      addCartItemForSession({ productId, quantity: 2 }, sessionId, client),
    ).resolves.toEqual({
      ok: true,
    });

    expect(client.product.findFirst).toHaveBeenCalledWith({
      where: {
        id: productId,
        isActive: true,
      },
      select: {
        id: true,
        inStock: true,
      },
    });
    expect(client.cart.upsert).toHaveBeenCalledWith({
      where: {
        sessionId,
      },
      create: {
        sessionId,
      },
      update: {},
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    expect(client.cartItem.create).toHaveBeenCalledWith({
      data: {
        cartId,
        productId,
        quantity: 2,
      },
    });
  });

  it("increments existing cart items without exceeding the maximum quantity", async () => {
    vi.mocked(client.cartItem.findUnique).mockResolvedValueOnce({
      quantity: maxCartItemQuantity - 1,
    });

    await addCartItemForSession({ productId, quantity: 4 }, sessionId, client);

    expect(client.cartItem.update).toHaveBeenCalledWith({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      data: {
        quantity: maxCartItemQuantity,
      },
    });
    expect(client.cartItem.create).not.toHaveBeenCalled();
  });

  it("rejects missing products before creating a cart item", async () => {
    vi.mocked(client.product.findFirst).mockResolvedValueOnce(null);

    await expect(
      addCartItemForSession({ productId, quantity: 1 }, sessionId, client),
    ).resolves.toEqual({
      ok: false,
      error: "Product is not available",
    });

    expect(client.cart.upsert).not.toHaveBeenCalled();
    expect(client.cartItem.create).not.toHaveBeenCalled();
  });

  it("rejects out-of-stock products before creating a cart item", async () => {
    vi.mocked(client.product.findFirst).mockResolvedValueOnce({ id: productId, inStock: false });

    await expect(
      addCartItemForSession({ productId, quantity: 1 }, sessionId, client),
    ).resolves.toEqual({
      ok: false,
      error: "Product is out of stock",
    });

    expect(client.cartItem.create).not.toHaveBeenCalled();
  });

  it("validates product IDs and quantities", async () => {
    await expect(
      addCartItemForSession({ productId: " ", quantity: 1 }, sessionId, client),
    ).resolves.toEqual({
      ok: false,
      error: "Product ID is required",
    });
    await expect(
      addCartItemForSession({ productId, quantity: 0 }, sessionId, client),
    ).resolves.toEqual({
      ok: false,
      error: `Quantity must be an integer between 1 and ${maxCartItemQuantity}`,
    });

    expect(client.product.findFirst).not.toHaveBeenCalled();
  });

  it("updates cart item quantity by product in the current cart", async () => {
    await expect(
      updateCartItemQuantityForSession({ productId, quantity: "3" }, sessionId, client),
    ).resolves.toEqual({
      ok: true,
    });

    expect(client.cart.findUnique).toHaveBeenCalledWith({
      where: {
        sessionId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    expect(client.cartItem.updateMany).toHaveBeenCalledWith({
      where: {
        cartId,
        productId,
      },
      data: {
        quantity: 3,
      },
    });
  });

  it("does not create a cart when updating without a session", async () => {
    await expect(
      updateCartItemQuantityForSession({ productId, quantity: 3 }, null, client),
    ).resolves.toEqual({
      ok: true,
    });

    expect(client.cart.findUnique).not.toHaveBeenCalled();
    expect(client.cartItem.updateMany).not.toHaveBeenCalled();
  });

  it("removes cart items by product in the current cart", async () => {
    await expect(removeCartItemForSession({ productId }, sessionId, client)).resolves.toEqual({
      ok: true,
    });

    expect(client.cartItem.deleteMany).toHaveBeenCalledWith({
      where: {
        cartId,
        productId,
      },
    });
  });
});
