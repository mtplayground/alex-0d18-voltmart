import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/db";

export type AdminOrderClient = Pick<PrismaClient, "order">;

export const adminOrderWithItems = {
  items: {
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.OrderInclude;

export type AdminOrderWithItems = Prisma.OrderGetPayload<{
  include: typeof adminOrderWithItems;
}>;

export async function listAdminOrders(client: AdminOrderClient = prisma) {
  return client.order.findMany({
    include: adminOrderWithItems,
    orderBy: [{ createdAt: "desc" }, { orderNumber: "desc" }],
  });
}

export async function getAdminOrderByNumber(
  orderNumber: string,
  client: AdminOrderClient = prisma,
) {
  const normalizedOrderNumber = orderNumber.trim();

  if (!normalizedOrderNumber) {
    return null;
  }

  return client.order.findUnique({
    where: {
      orderNumber: normalizedOrderNumber,
    },
    include: adminOrderWithItems,
  });
}
