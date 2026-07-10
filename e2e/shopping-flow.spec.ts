import { execFileSync } from "node:child_process";

import { expect, test } from "@playwright/test";

const productName = "Compact 5G Phone";
const adminEmail = process.env.ADMIN_EMAIL ?? "e2e-admin@example.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "e2e-password";

function requireDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for e2e database seeding");
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test.beforeAll(() => {
  requireDatabaseUrl();
  execFileSync("npx", ["prisma", "db", "seed"], {
    stdio: "inherit",
    env: process.env,
  });
});

test("browse, checkout, confirm, and review the order in admin", async ({ page }) => {
  const runId = Date.now();
  const customerName = `E2E Customer ${runId}`;
  const customerEmail = `e2e-${runId}@example.com`;

  await page.goto("/");
  const productCard = page.locator("article").filter({ hasText: productName });
  await expect(productCard).toBeVisible();
  await productCard.getByRole("link", { name: "View details" }).click();

  await expect(page.getByRole("heading", { name: productName })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect
    .poll(async () => {
      const response = await page.request.get("/api/cart/summary");
      const body = (await response.json()) as { itemCount?: unknown };

      return body.itemCount;
    })
    .toBe(1);

  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Shopping cart" })).toBeVisible();
  await expect(page.getByRole("link", { name: productName })).toBeVisible();
  await page.getByRole("link", { name: "Proceed to checkout" }).click();

  await expect(page.getByRole("heading", { name: "Guest checkout" })).toBeVisible();
  await page.getByLabel("Full name").fill(customerName);
  await page.getByLabel("Email").fill(customerEmail);
  await page.getByLabel("Phone").fill("555-0101");
  await page.getByLabel("Recipient name").fill(customerName);
  await page.getByLabel("Address line 1").fill("123 Test Street");
  await page.getByLabel("Address line 2").fill("Suite 4");
  await page.getByLabel("City").fill("Testville");
  await page.getByLabel("State or region").fill("CA");
  await page.getByLabel("Postal code").fill("94105");
  await page.getByLabel("Country").fill("United States");
  await page.getByRole("button", { name: "Submit order" }).click();

  await expect(page).toHaveURL(/\/orders\/ORD-/);
  await expect(page.getByRole("heading", { name: `Thanks, ${customerName}` })).toBeVisible();

  const orderReferenceText = await page.getByText(/ORD-\d{8}-[A-Z0-9]{8}/).first().textContent();
  const orderNumber = orderReferenceText?.match(/ORD-\d{8}-[A-Z0-9]{8}/)?.[0];
  expect(orderNumber, "order confirmation should show an order reference").toBeTruthy();

  await page.goto(`/admin/orders/${orderNumber}`);
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(new RegExp(`/admin/orders/${escapeRegExp(orderNumber!)}$`));
  await expect(page.getByRole("heading", { name: orderNumber! })).toBeVisible();
  await expect(page.locator("dd").filter({ hasText: customerName })).toBeVisible();
  await expect(page.locator("dd").filter({ hasText: customerEmail })).toBeVisible();
  await expect(page.getByRole("link", { name: productName })).toBeVisible();

  await page.goto("/admin/orders");
  await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
  await expect(page.getByRole("link", { name: orderNumber! }).first()).toBeVisible();
});
