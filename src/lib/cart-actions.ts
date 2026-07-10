import type { PrismaClient } from "@prisma/client";

import { getCartBySessionId, getOrCreateCartBySessionId, type CartClient } from "@/lib/cart";
import { getCartSessionId, getOrCreateCartSessionId } from "@/lib/cart-session";
import { prisma } from "@/lib/db";

export const maxCartItemQuantity = 99;

export type CartActionResult = Readonly<
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    }
>;

export type CartItemInput = Readonly<{
  productId: unknown;
  quantity?: unknown;
}>;

export type CartActionClient = CartClient & {
  product: Pick<PrismaClient["product"], "findFirst">;
  cartItem: Pick<
    PrismaClient["cartItem"],
    "create" | "deleteMany" | "findUnique" | "update" | "updateMany"
  >;
};

function fail(error: string): CartActionResult {
  return {
    ok: false,
    error,
  };
}

function normalizeProductId(productId: unknown) {
  if (typeof productId !== "string") {
    return null;
  }

  const trimmedProductId = productId.trim();

  return trimmedProductId ? trimmedProductId : null;
}

function normalizeQuantity(quantity: unknown) {
  const numericQuantity = typeof quantity === "string" ? Number(quantity) : quantity;

  if (
    typeof numericQuantity !== "number" ||
    !Number.isInteger(numericQuantity) ||
    numericQuantity < 1 ||
    numericQuantity > maxCartItemQuantity
  ) {
    return null;
  }

  return numericQuantity;
}

async function findPurchasableProduct(productId: string, client: CartActionClient) {
  return client.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
    select: {
      id: true,
      inStock: true,
    },
  });
}

export async function addCartItemForSession(
  input: CartItemInput,
  sessionId: string,
  client: CartActionClient = prisma,
): Promise<CartActionResult> {
  const productId = normalizeProductId(input.productId);

  if (!productId) {
    return fail("Product ID is required");
  }

  const quantity = normalizeQuantity(input.quantity ?? 1);

  if (!quantity) {
    return fail(`Quantity must be an integer between 1 and ${maxCartItemQuantity}`);
  }

  const product = await findPurchasableProduct(productId, client);

  if (!product) {
    return fail("Product is not available");
  }

  if (!product.inStock) {
    return fail("Product is out of stock");
  }

  const cart = await getOrCreateCartBySessionId(sessionId, client);
  const existingCartItem = await client.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    select: {
      quantity: true,
    },
  });

  if (existingCartItem) {
    await client.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      data: {
        quantity: Math.min(existingCartItem.quantity + quantity, maxCartItemQuantity),
      },
    });
  } else {
    await client.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  return {
    ok: true,
  };
}

export async function updateCartItemQuantityForSession(
  input: CartItemInput,
  sessionId: string | null,
  client: CartActionClient = prisma,
): Promise<CartActionResult> {
  const productId = normalizeProductId(input.productId);

  if (!productId) {
    return fail("Product ID is required");
  }

  const quantity = normalizeQuantity(input.quantity);

  if (!quantity) {
    return fail(`Quantity must be an integer between 1 and ${maxCartItemQuantity}`);
  }

  const cart = await getCartBySessionId(sessionId ?? undefined, client);

  if (!cart) {
    return {
      ok: true,
    };
  }

  await client.cartItem.updateMany({
    where: {
      cartId: cart.id,
      productId,
    },
    data: {
      quantity,
    },
  });

  return {
    ok: true,
  };
}

export async function removeCartItemForSession(
  input: Pick<CartItemInput, "productId">,
  sessionId: string | null,
  client: CartActionClient = prisma,
): Promise<CartActionResult> {
  const productId = normalizeProductId(input.productId);

  if (!productId) {
    return fail("Product ID is required");
  }

  const cart = await getCartBySessionId(sessionId ?? undefined, client);

  if (!cart) {
    return {
      ok: true,
    };
  }

  await client.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  return {
    ok: true,
  };
}

export async function addCartItemForCurrentSession(
  input: CartItemInput,
  client: CartActionClient = prisma,
) {
  const sessionId = await getOrCreateCartSessionId();

  return addCartItemForSession(input, sessionId, client);
}

export async function updateCartItemQuantityForCurrentSession(
  input: CartItemInput,
  client: CartActionClient = prisma,
) {
  const sessionId = await getCartSessionId();

  return updateCartItemQuantityForSession(input, sessionId, client);
}

export async function removeCartItemForCurrentSession(
  input: Pick<CartItemInput, "productId">,
  client: CartActionClient = prisma,
) {
  const sessionId = await getCartSessionId();

  return removeCartItemForSession(input, sessionId, client);
}
