import { getAdminEmailRecipient, sendEmail, type EmailSendResult } from "@/lib/email";
import { formatCurrencyFromCents } from "@/lib/format";

type EmailEnvironment = Readonly<Record<string, string | undefined>> &
  Readonly<{
    ADMIN_EMAIL?: string;
    MCTAI_EMAIL_URL?: string;
    MCTAI_EMAIL_APP_TOKEN?: string;
    SELF_URL?: string;
  }>;

export type NewOrderNotificationItem = Readonly<{
  productName: string;
  productSlug: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}>;

export type NewOrderNotification = Readonly<{
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingName: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingRegion: string;
  shippingPostalCode: string;
  shippingCountry: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  items: NewOrderNotificationItem[];
}>;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function orderUrl(orderNumber: string, env: EmailEnvironment) {
  const selfUrl = env.SELF_URL?.trim();

  if (!selfUrl) {
    return null;
  }

  return `${selfUrl.replace(/\/$/, "")}/orders/${encodeURIComponent(orderNumber)}`;
}

export function renderNewOrderAdminEmail(order: NewOrderNotification, env: EmailEnvironment = {}) {
  const confirmationUrl = orderUrl(order.orderNumber, env);
  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e6e8ef;">
            <strong>${escapeHtml(item.productName)}</strong><br>
            <span style="color:#667085;">${escapeHtml(item.productSlug)}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e6e8ef;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e6e8ef;text-align:right;">${formatCurrencyFromCents(item.unitPriceCents)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e6e8ef;text-align:right;">${formatCurrencyFromCents(item.lineTotalCents)}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
      <h1 style="margin:0 0 12px;">New order ${escapeHtml(order.orderNumber)}</h1>
      <p style="margin:0 0 20px;color:#475467;">A guest checkout order was submitted.</p>
      ${
        confirmationUrl
          ? `<p style="margin:0 0 20px;"><a href="${escapeHtml(confirmationUrl)}">View order confirmation</a></p>`
          : ""
      }

      <h2 style="font-size:18px;margin:24px 0 8px;">Customer</h2>
      <p style="margin:0;">
        ${escapeHtml(order.customerName)}<br>
        ${escapeHtml(order.customerEmail)}${
          order.customerPhone ? `<br>${escapeHtml(order.customerPhone)}` : ""
        }
      </p>

      <h2 style="font-size:18px;margin:24px 0 8px;">Shipping</h2>
      <p style="margin:0;">
        ${escapeHtml(order.shippingName)}<br>
        ${escapeHtml(order.shippingAddressLine1)}<br>
        ${order.shippingAddressLine2 ? `${escapeHtml(order.shippingAddressLine2)}<br>` : ""}
        ${escapeHtml(order.shippingCity)}, ${escapeHtml(order.shippingRegion)} ${escapeHtml(order.shippingPostalCode)}<br>
        ${escapeHtml(order.shippingCountry)}
      </p>

      <h2 style="font-size:18px;margin:24px 0 8px;">Items</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:2px solid #d0d5dd;padding:8px 0;">Item</th>
            <th style="text-align:center;border-bottom:2px solid #d0d5dd;padding:8px 0;">Qty</th>
            <th style="text-align:right;border-bottom:2px solid #d0d5dd;padding:8px 0;">Unit</th>
            <th style="text-align:right;border-bottom:2px solid #d0d5dd;padding:8px 0;">Line</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <h2 style="font-size:18px;margin:24px 0 8px;">Totals</h2>
      <p style="margin:0;">
        Subtotal: ${formatCurrencyFromCents(order.subtotalCents)}<br>
        Shipping: ${formatCurrencyFromCents(order.shippingCents)}<br>
        Tax: ${formatCurrencyFromCents(order.taxCents)}<br>
        <strong>Total: ${formatCurrencyFromCents(order.totalCents)}</strong>
      </p>
    </div>
  `;

  const textLines = [
    `New order ${order.orderNumber}`,
    confirmationUrl ? `View: ${confirmationUrl}` : null,
    "",
    "Customer",
    order.customerName,
    order.customerEmail,
    order.customerPhone,
    "",
    "Shipping",
    order.shippingName,
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    `${order.shippingCity}, ${order.shippingRegion} ${order.shippingPostalCode}`,
    order.shippingCountry,
    "",
    "Items",
    ...order.items.map(
      (item) =>
        `${item.quantity} x ${item.productName} at ${formatCurrencyFromCents(
          item.unitPriceCents,
        )}: ${formatCurrencyFromCents(item.lineTotalCents)}`,
    ),
    "",
    `Subtotal: ${formatCurrencyFromCents(order.subtotalCents)}`,
    `Shipping: ${formatCurrencyFromCents(order.shippingCents)}`,
    `Tax: ${formatCurrencyFromCents(order.taxCents)}`,
    `Total: ${formatCurrencyFromCents(order.totalCents)}`,
  ].filter((line): line is string => line !== null && line !== "");

  return {
    subject: `New order ${order.orderNumber}`,
    html,
    text: textLines.join("\n"),
  };
}

export async function sendNewOrderAdminNotification(
  order: NewOrderNotification,
  env: EmailEnvironment = process.env,
  sendEmailImpl: typeof sendEmail = sendEmail,
): Promise<EmailSendResult> {
  const to = getAdminEmailRecipient(env);

  if (!to) {
    return {
      status: "skipped",
      reason: "admin email not configured",
    };
  }

  const email = renderNewOrderAdminEmail(order, env);

  return sendEmailImpl(
    {
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: order.customerEmail,
    },
    env,
  );
}
