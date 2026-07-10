import { describe, expect, it, vi } from "vitest";

import {
  renderNewOrderAdminEmail,
  sendNewOrderAdminNotification,
  type NewOrderNotification,
} from "@/lib/order-email";

const order: NewOrderNotification = {
  orderId: "order_1",
  orderNumber: "ORD-20260710-ABC12345",
  customerName: "Taylor <Morgan>",
  customerEmail: "taylor@example.com",
  customerPhone: "555-123-4567",
  shippingName: "Taylor Morgan",
  shippingAddressLine1: "100 Market Street",
  shippingAddressLine2: "Suite 8",
  shippingCity: "Denver",
  shippingRegion: "CO",
  shippingPostalCode: "80202",
  shippingCountry: "United States",
  subtotalCents: 99800,
  shippingCents: 0,
  taxCents: 0,
  totalCents: 99800,
  items: [
    {
      productName: "Compact 5G Phone & Case",
      productSlug: "compact-5g-phone",
      unitPriceCents: 49900,
      quantity: 2,
      lineTotalCents: 99800,
    },
  ],
};

describe("new order admin email", () => {
  it("renders escaped html and plain text order details", () => {
    const email = renderNewOrderAdminEmail(order, {
      SELF_URL: "https://store.example.test/",
    });

    expect(email.subject).toBe("New order ORD-20260710-ABC12345");
    expect(email.html).toContain("Taylor &lt;Morgan&gt;");
    expect(email.html).toContain("Compact 5G Phone &amp; Case");
    expect(email.html).toContain("https://store.example.test/orders/ORD-20260710-ABC12345");
    expect(email.text).toContain("Taylor <Morgan>");
    expect(email.text).toContain("2 x Compact 5G Phone & Case at $499.00: $998.00");
    expect(email.text).toContain("Total: $998.00");
  });

  it("skips notification when admin recipient is not configured", async () => {
    const sendEmail = vi.fn();

    await expect(sendNewOrderAdminNotification(order, {}, sendEmail)).resolves.toEqual({
      status: "skipped",
      reason: "admin email not configured",
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends the rendered notification to the configured admin recipient", async () => {
    const sendEmail = vi.fn().mockResolvedValue({ status: "sent", id: "message_1" });

    await expect(
      sendNewOrderAdminNotification(
        order,
        {
          ADMIN_EMAIL: "admin@example.com",
          MCTAI_EMAIL_URL: "https://email.example.test/send",
          MCTAI_EMAIL_APP_TOKEN: "app-token",
        },
        sendEmail,
      ),
    ).resolves.toEqual({
      status: "sent",
      id: "message_1",
    });

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin@example.com",
        subject: "New order ORD-20260710-ABC12345",
        replyTo: "taylor@example.com",
      }),
      expect.objectContaining({
        ADMIN_EMAIL: "admin@example.com",
        MCTAI_EMAIL_URL: "https://email.example.test/send",
        MCTAI_EMAIL_APP_TOKEN: "app-token",
      }),
    );
  });
});
