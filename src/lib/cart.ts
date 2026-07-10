import type { Prisma, PrismaClient } from "@prisma/client";

import {
  getOrCreateCartSessionId,
  isValidCartSessionId,
  type CartCookieStore,
  ensureCartSessionIdInStore,
} from "@/lib/cart-session";
import { prisma } from "@/lib/db";

export type CartClient = Pick<PrismaClient, "cart">;

const cartWithItems = {
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
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{
  include: typeof cartWithItems;
}>;

export async function getCartBySessionId(
  sessionId: string | undefined,
  client: CartClient = prisma,
): Promise<CartWithItems | null> {
  if (!isValidCartSessionId(sessionId)) {
    return null;
  }

  return client.cart.findUnique({
    where: {
      sessionId,
    },
    include: cartWithItems,
  });
}

export async function getOrCreateCartBySessionId(
  sessionId: string,
  client: CartClient = prisma,
): Promise<CartWithItems> {
  if (!isValidCartSessionId(sessionId)) {
    throw new Error("Cart session ID is invalid");
  }

  return client.cart.upsert({
    where: {
      sessionId,
    },
    create: {
      sessionId,
    },
    update: {},
    include: cartWithItems,
  });
}

export async function getOrCreateCartFromCookieStore(
  cookieStore: CartCookieStore,
  client: CartClient = prisma,
) {
  const sessionId = ensureCartSessionIdInStore(cookieStore);

  return getOrCreateCartBySessionId(sessionId, client);
}

export async function getOrCreateCurrentCart(client: CartClient = prisma) {
  const sessionId = await getOrCreateCartSessionId();

  return getOrCreateCartBySessionId(sessionId, client);
}
