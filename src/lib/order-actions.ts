import type { PrismaClient } from "@prisma/client";

import { getCartBySessionId, type CartClient } from "@/lib/cart";
import { getCartSessionId } from "@/lib/cart-session";
import {
  type CheckoutFormState,
  type CheckoutFormValues,
  validateCheckoutFormData,
} from "@/lib/checkout-validation";
import { getCartLineTotalCents, getCartSubtotalCents } from "@/lib/cart-summary";
import { prisma } from "@/lib/db";
import { sendNewOrderAdminNotification, type NewOrderNotification } from "@/lib/order-email";

type OrderReference = Readonly<{
  id: string;
  orderNumber: string;
}>;

type OrderSubmissionResult = Readonly<{
  state: CheckoutFormState;
  notification: NewOrderNotification | null;
}>;

type OrderNotificationSender = (notification: NewOrderNotification) => Promise<unknown>;

type OrderTransactionClient = CartClient & {
  cart: CartClient["cart"] & Pick<PrismaClient["cart"], "delete">;
  cartItem: Pick<PrismaClient["cartItem"], "deleteMany">;
  order: Pick<PrismaClient["order"], "create">;
};

export type OrderSubmissionClient = OrderTransactionClient & {
  $transaction<T>(callback: (transactionClient: OrderTransactionClient) => Promise<T>): Promise<T>;
};

function fail(message: string, values: CheckoutFormValues): CheckoutFormState {
  return {
    status: "error",
    message,
    values,
    errors: {},
  };
}

function toResult(
  state: CheckoutFormState,
  notification: NewOrderNotification | null = null,
): OrderSubmissionResult {
  return {
    state,
    notification,
  };
}

export function createOrderNumber(now = new Date(), randomId = crypto.randomUUID()) {
  const datePart = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomId.replaceAll("-", "").slice(0, 8).toUpperCase();

  return `ORD-${datePart}-${suffix}`;
}

export async function submitOrderForSession(
  formData: FormData,
  sessionId: string | null,
  client: OrderSubmissionClient = prisma,
  orderNumber = createOrderNumber(),
  sendNotification: OrderNotificationSender = sendNewOrderAdminNotification,
): Promise<CheckoutFormState> {
  const validationState = validateCheckoutFormData(formData);

  if (validationState.status === "error") {
    return validationState;
  }

  if (!sessionId) {
    return fail("Cart is empty", validationState.values);
  }

  const result = await client.$transaction(async (transactionClient) => {
    const cart = await getCartBySessionId(sessionId, transactionClient);

    if (!cart || cart.items.length === 0) {
      return toResult(fail("Cart is empty", validationState.values));
    }

    const unavailableItem = cart.items.find(
      (item) => !item.product.isActive || !item.product.inStock,
    );

    if (unavailableItem) {
      return toResult(
        fail(`${unavailableItem.product.name} is not available`, validationState.values),
      );
    }

    const subtotalCents = getCartSubtotalCents(cart);
    const shippingCents = 0;
    const taxCents = 0;
    const totalCents = subtotalCents;
    const order = (await transactionClient.order.create({
      data: {
        orderNumber,
        customerName: validationState.values.customerName,
        customerEmail: validationState.values.customerEmail,
        customerPhone: validationState.values.customerPhone || null,
        shippingName: validationState.values.shippingName,
        shippingAddressLine1: validationState.values.shippingAddressLine1,
        shippingAddressLine2: validationState.values.shippingAddressLine2 || null,
        shippingCity: validationState.values.shippingCity,
        shippingRegion: validationState.values.shippingRegion,
        shippingPostalCode: validationState.values.shippingPostalCode,
        shippingCountry: validationState.values.shippingCountry,
        subtotalCents,
        shippingCents,
        taxCents,
        totalCents,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productSlug: item.product.slug,
            productImageKey: item.product.imageKeys[0] ?? null,
            unitPriceCents: item.product.priceCents,
            quantity: item.quantity,
            lineTotalCents: getCartLineTotalCents(item),
          })),
        },
      },
      select: {
        id: true,
        orderNumber: true,
      },
    })) as OrderReference;

    await transactionClient.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
    await transactionClient.cart.delete({
      where: {
        id: cart.id,
      },
    });

    return toResult(
      {
        status: "success",
        message: "Order submitted",
        orderId: order.id,
        orderNumber: order.orderNumber,
        values: validationState.values,
        errors: {},
      },
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: validationState.values.customerName,
        customerEmail: validationState.values.customerEmail,
        customerPhone: validationState.values.customerPhone || null,
        shippingName: validationState.values.shippingName,
        shippingAddressLine1: validationState.values.shippingAddressLine1,
        shippingAddressLine2: validationState.values.shippingAddressLine2 || null,
        shippingCity: validationState.values.shippingCity,
        shippingRegion: validationState.values.shippingRegion,
        shippingPostalCode: validationState.values.shippingPostalCode,
        shippingCountry: validationState.values.shippingCountry,
        subtotalCents,
        shippingCents,
        taxCents,
        totalCents,
        items: cart.items.map((item) => ({
          productName: item.product.name,
          productSlug: item.product.slug,
          unitPriceCents: item.product.priceCents,
          quantity: item.quantity,
          lineTotalCents: getCartLineTotalCents(item),
        })),
      },
    );
  });

  if (result.state.status === "success" && result.notification) {
    try {
      await sendNotification(result.notification);
    } catch (error) {
      console.error("New order email notification failed", error);
    }
  }

  return result.state;
}

export async function submitOrderForCurrentSession(
  formData: FormData,
  client: OrderSubmissionClient = prisma,
) {
  const sessionId = await getCartSessionId();

  return submitOrderForSession(formData, sessionId, client);
}
