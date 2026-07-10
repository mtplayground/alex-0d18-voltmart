import { describe, expect, it, vi } from "vitest";

import { getAdminEmailRecipient, sendEmail } from "@/lib/email";

describe("platform email utility", () => {
  it("reads the admin recipient from ADMIN_EMAIL", () => {
    expect(getAdminEmailRecipient({ ADMIN_EMAIL: " admin@example.com " })).toBe(
      "admin@example.com",
    );
    expect(getAdminEmailRecipient({})).toBeNull();
  });

  it("skips sends when the platform email service is not configured", async () => {
    const fetchImpl = vi.fn();

    await expect(
      sendEmail(
        {
          to: "admin@example.com",
          subject: "New order",
          text: "Order details",
        },
        {},
        fetchImpl as unknown as typeof fetch,
      ),
    ).resolves.toEqual({
      status: "skipped",
      reason: "email service not configured",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts through the platform email endpoint without a from field", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "message_1" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    await expect(
      sendEmail(
        {
          to: "admin@example.com",
          subject: "New order",
          html: "<p>Order details</p>",
          text: "Order details",
          replyTo: "customer@example.com",
        },
        {
          MCTAI_EMAIL_URL: "https://email.example.test/send",
          MCTAI_EMAIL_APP_TOKEN: "app-token",
        },
        fetchImpl as unknown as typeof fetch,
      ),
    ).resolves.toEqual({
      status: "sent",
      id: "message_1",
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://email.example.test/send",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer app-token",
          "Content-Type": "application/json",
        },
      }),
    );

    const body = JSON.parse(fetchImpl.mock.calls[0][1].body as string) as Record<string, unknown>;
    expect(body).toMatchObject({
      to: "admin@example.com",
      subject: "New order",
      html: "<p>Order details</p>",
      text: "Order details",
      reply_to: "customer@example.com",
    });
    expect(body).not.toHaveProperty("from");
  });

  it("surfaces email service rate limiting", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("slow down", { status: 429 }));

    await expect(
      sendEmail(
        {
          to: "admin@example.com",
          subject: "New order",
          text: "Order details",
        },
        {
          MCTAI_EMAIL_URL: "https://email.example.test/send",
          MCTAI_EMAIL_APP_TOKEN: "app-token",
        },
        fetchImpl as unknown as typeof fetch,
      ),
    ).rejects.toThrow("email rate limited");
  });
});
