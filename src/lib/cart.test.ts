import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CartClient } from "@/lib/cart";
import {
  getCartBySessionId,
  getOrCreateCartBySessionId,
  getOrCreateCartFromCookieStore,
} from "@/lib/cart";
import { cartSessionCookieName, type CartCookieStore } from "@/lib/cart-session";

const validSessionId = "550e8400-e29b-41d4-a716-446655440000";

function createCartClient(): CartClient {
  return {
    cart: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: "cart_1", sessionId: validSessionId, items: [] }),
    },
  } as unknown as CartClient;
}

function createCookieStore(initialSessionId?: string) {
  const values = new Map<string, string>();

  if (initialSessionId) {
    values.set(cartSessionCookieName, initialSessionId);
  }

  return {
    get: vi.fn((name: string) => {
      const value = values.get(name);

      return value ? { value } : undefined;
    }),
    set: vi.fn((name: string, value: string) => {
      values.set(name, value);
    }),
  } satisfies CartCookieStore;
}

describe("cart query helpers", () => {
  let client: CartClient;

  beforeEach(() => {
    client = createCartClient();
  });

  it("does not query carts for invalid session IDs", async () => {
    await expect(getCartBySessionId("bad value", client)).resolves.toBeNull();

    expect(client.cart.findUnique).not.toHaveBeenCalled();
  });

  it("loads a cart with product and category details by session ID", async () => {
    await getCartBySessionId(validSessionId, client);

    expect(client.cart.findUnique).toHaveBeenCalledWith({
      where: {
        sessionId: validSessionId,
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
  });

  it("upserts carts by valid session ID", async () => {
    await getOrCreateCartBySessionId(validSessionId, client);

    expect(client.cart.upsert).toHaveBeenCalledWith({
      where: {
        sessionId: validSessionId,
      },
      create: {
        sessionId: validSessionId,
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
  });

  it("rejects malformed session IDs before upserting", async () => {
    await expect(getOrCreateCartBySessionId("bad value", client)).rejects.toThrow(
      "Cart session ID is invalid",
    );

    expect(client.cart.upsert).not.toHaveBeenCalled();
  });

  it("creates a cookie session before upserting a cart when missing", async () => {
    const cookieStore = createCookieStore();

    await getOrCreateCartFromCookieStore(cookieStore, client);

    expect(cookieStore.set).toHaveBeenCalledOnce();
    expect(client.cart.upsert).toHaveBeenCalledOnce();
  });
});
