import { describe, expect, it, vi } from "vitest";

import {
  adminOrderWithItems,
  getAdminOrderByNumber,
  listAdminOrders,
  type AdminOrderClient,
} from "@/lib/admin-orders";

function createAdminOrderClient(): AdminOrderClient {
  return {
    order: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
  } as unknown as AdminOrderClient;
}

describe("admin order helpers", () => {
  it("lists newest orders first with line items included", async () => {
    const client = createAdminOrderClient();

    await listAdminOrders(client);

    expect(client.order.findMany).toHaveBeenCalledWith({
      include: adminOrderWithItems,
      orderBy: [{ createdAt: "desc" }, { orderNumber: "desc" }],
    });
  });

  it("loads orders by normalized order number", async () => {
    const client = createAdminOrderClient();

    await getAdminOrderByNumber(" ORD-20260710-12345678 ", client);

    expect(client.order.findUnique).toHaveBeenCalledWith({
      where: {
        orderNumber: "ORD-20260710-12345678",
      },
      include: adminOrderWithItems,
    });
  });

  it("skips blank order number lookups", async () => {
    const client = createAdminOrderClient();

    await expect(getAdminOrderByNumber("   ", client)).resolves.toBeNull();
    expect(client.order.findUnique).not.toHaveBeenCalled();
  });
});
