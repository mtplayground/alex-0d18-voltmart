import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createOrderNumber,
  submitOrderForSession,
  type OrderSubmissionClient,
} from "@/lib/order-actions";

const sessionId = "550e8400-e29b-41d4-a716-446655440000";
const orderNumber = "ORD-20260710-ABC12345";
const cartId = "cart_1";

const checkoutValues = {
  customerName: "Taylor Morgan",
  customerEmail: "taylor@example.com",
  customerPhone: "555-123-4567",
  shippingName: "Taylor Morgan",
  shippingAddressLine1: "100 Market Street",
  shippingAddressLine2: "",
  shippingCity: "Denver",
  shippingRegion: "CO",
  shippingPostalCode: "80202",
  shippingCountry: "United States",
};

const cart = {
  id: cartId,
  sessionId,
  items: [
    {
      id: "cart_item_1",
      productId: "product_1",
      quantity: 2,
      product: {
        id: "product_1",
        name: "Compact 5G Phone",
        slug: "compact-5g-phone",
        priceCents: 49900,
        imageKeys: ["/placeholders/catalog/phones.svg"],
        inStock: true,
        isActive: true,
      },
    },
  ],
};

function createFormData(values: Record<string, string>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

function createOrderSubmissionClient(cartValue: unknown = cart) {
  const transactionClient = {
    cart: {
      findUnique: vi.fn().mockResolvedValue(cartValue),
      delete: vi.fn().mockResolvedValue({ id: cartId }),
    },
    cartItem: {
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    order: {
      create: vi.fn().mockResolvedValue({ id: "order_1", orderNumber }),
    },
  };

  return {
    ...transactionClient,
    $transaction: vi.fn(async (callback) => callback(transactionClient)),
  } as unknown as OrderSubmissionClient & {
    $transaction: ReturnType<typeof vi.fn>;
    cart: typeof transactionClient.cart;
    cartItem: typeof transactionClient.cartItem;
    order: typeof transactionClient.order;
  };
}

describe("order submission actions", () => {
  let client: ReturnType<typeof createOrderSubmissionClient>;

  beforeEach(() => {
    client = createOrderSubmissionClient();
  });

  it("creates an order from the current cart and clears the cart", async () => {
    await expect(
      submitOrderForSession(createFormData(checkoutValues), sessionId, client, orderNumber),
    ).resolves.toMatchObject({
      status: "success",
      message: "Order submitted",
      orderId: "order_1",
      orderNumber,
    });

    expect(client.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderNumber,
        customerName: checkoutValues.customerName,
        customerEmail: checkoutValues.customerEmail,
        customerPhone: checkoutValues.customerPhone,
        shippingName: checkoutValues.shippingName,
        shippingAddressLine1: checkoutValues.shippingAddressLine1,
        shippingAddressLine2: null,
        subtotalCents: 99800,
        totalCents: 99800,
        items: {
          create: [
            {
              productId: "product_1",
              productName: "Compact 5G Phone",
              productSlug: "compact-5g-phone",
              productImageKey: "/placeholders/catalog/phones.svg",
              unitPriceCents: 49900,
              quantity: 2,
              lineTotalCents: 99800,
            },
          ],
        },
      }),
      select: {
        id: true,
        orderNumber: true,
      },
    });
    expect(client.cartItem.deleteMany).toHaveBeenCalledWith({
      where: {
        cartId,
      },
    });
    expect(client.cart.delete).toHaveBeenCalledWith({
      where: {
        id: cartId,
      },
    });
  });

  it("does not open a transaction when checkout details are invalid", async () => {
    await expect(
      submitOrderForSession(createFormData({}), sessionId, client, orderNumber),
    ).resolves.toMatchObject({
      status: "error",
      message: "Review the highlighted fields",
    });

    expect(client.$transaction).not.toHaveBeenCalled();
  });

  it("rejects missing carts", async () => {
    client = createOrderSubmissionClient(null);

    await expect(
      submitOrderForSession(createFormData(checkoutValues), sessionId, client, orderNumber),
    ).resolves.toMatchObject({
      status: "error",
      message: "Cart is empty",
    });

    expect(client.order.create).not.toHaveBeenCalled();
    expect(client.cart.delete).not.toHaveBeenCalled();
  });

  it("rejects unavailable cart products", async () => {
    client = createOrderSubmissionClient({
      ...cart,
      items: [
        {
          ...cart.items[0],
          product: {
            ...cart.items[0].product,
            inStock: false,
          },
        },
      ],
    });

    await expect(
      submitOrderForSession(createFormData(checkoutValues), sessionId, client, orderNumber),
    ).resolves.toMatchObject({
      status: "error",
      message: "Compact 5G Phone is not available",
    });

    expect(client.order.create).not.toHaveBeenCalled();
    expect(client.cartItem.deleteMany).not.toHaveBeenCalled();
  });

  it("creates stable order number prefixes with random suffixes", () => {
    expect(createOrderNumber(new Date("2026-07-10T12:00:00Z"), "abcdef12-3456")).toBe(
      "ORD-20260710-ABCDEF12",
    );
  });
});
