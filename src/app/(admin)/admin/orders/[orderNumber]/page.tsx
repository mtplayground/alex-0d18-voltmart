import type { OrderStatus } from "@prisma/client";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminOrderByNumber } from "@/lib/admin-orders";
import { formatCurrencyFromCents } from "@/lib/format";
import { getProductImageSrc } from "@/lib/product-images";

export const dynamic = "force-dynamic";

type AdminOrderDetailPageProps = Readonly<{
  params: Promise<{
    orderNumber: string;
  }>;
}>;

const orderDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatOrderDate(date: Date) {
  return orderDateFormatter.format(date);
}

function statusClassName(status: OrderStatus) {
  switch (status) {
    case "CONFIRMED":
      return "bg-mint/15 text-ink";
    case "FULFILLED":
      return "bg-electric/15 text-ink";
    case "CANCELLED":
      return "bg-coral/15 text-ink";
    case "PENDING":
    default:
      return "bg-sun/25 text-ink";
  }
}

export async function generateMetadata({
  params,
}: AdminOrderDetailPageProps): Promise<Metadata> {
  const { orderNumber } = await params;

  return {
    title: `Order ${orderNumber}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { orderNumber } = await params;
  const order = await getAdminOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="page-frame">
      <Link
        href="/admin/orders"
        className="text-sm font-bold text-electric underline-offset-4 hover:underline"
      >
        Back to orders
      </Link>
      <section className="mt-6" aria-labelledby="admin-order-title">
        <p className="eyebrow">Admin order</p>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 id="admin-order-title" className="page-title">
              {order.orderNumber}
            </h1>
            <p className="page-copy">
              Submitted {formatOrderDate(order.createdAt)} by {order.customerName}.
            </p>
          </div>
          <span
            className={`inline-flex w-fit rounded-full px-3 py-2 text-sm font-black ${statusClassName(
              order.status,
            )}`}
          >
            {order.status}
          </span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section
            aria-label="Order line items"
            className="rounded-card border border-border bg-panel-strong p-5 shadow-soft"
          >
            <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-ink">Line items</h2>
                <p className="mt-1 text-sm font-semibold text-muted">
                  {itemCount} {itemCount === 1 ? "item" : "items"} in this order
                </p>
              </div>
              <p className="text-2xl font-black text-ink">
                {formatCurrencyFromCents(order.totalCents)}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-card border border-border bg-panel p-4 sm:grid-cols-[96px_minmax(0,1fr)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-canvas">
                    <Image
                      src={getProductImageSrc(item.productImageKey ?? undefined)}
                      alt={`${item.productName} product image`}
                      fill
                      className="object-cover p-3"
                      sizes="96px"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="text-lg font-black text-ink hover:text-electric"
                        >
                          {item.productName}
                        </Link>
                        <p className="mt-2 text-sm font-semibold text-muted">
                          Qty {item.quantity} x {formatCurrencyFromCents(item.unitPriceCents)}
                        </p>
                      </div>
                      <p className="text-lg font-black text-ink">
                        {formatCurrencyFromCents(item.lineTotalCents)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-card border border-border bg-panel-strong p-5 shadow-soft">
              <h2 className="text-xl font-black text-ink">Customer</h2>
              <dl className="mt-4 space-y-4 text-sm leading-6">
                <div>
                  <dt className="font-semibold text-muted">Name</dt>
                  <dd className="font-black text-ink">{order.customerName}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-muted">Email</dt>
                  <dd className="font-black text-ink">{order.customerEmail}</dd>
                </div>
                {order.customerPhone ? (
                  <div>
                    <dt className="font-semibold text-muted">Phone</dt>
                    <dd className="font-black text-ink">{order.customerPhone}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="rounded-card border border-border bg-panel-strong p-5 shadow-soft">
              <h2 className="text-xl font-black text-ink">Shipping</h2>
              <div className="mt-4 text-sm leading-6">
                <p className="font-black text-ink">{order.shippingName}</p>
                <p className="text-muted">{order.shippingAddressLine1}</p>
                {order.shippingAddressLine2 ? (
                  <p className="text-muted">{order.shippingAddressLine2}</p>
                ) : null}
                <p className="text-muted">
                  {order.shippingCity}, {order.shippingRegion} {order.shippingPostalCode}
                </p>
                <p className="text-muted">{order.shippingCountry}</p>
              </div>
            </section>

            <section className="rounded-card border border-border bg-panel-strong p-5 shadow-soft">
              <h2 className="text-xl font-black text-ink">Totals</h2>
              <dl className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <dt className="font-semibold text-muted">Subtotal</dt>
                  <dd className="font-black text-ink">
                    {formatCurrencyFromCents(order.subtotalCents)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <dt className="font-semibold text-muted">Shipping</dt>
                  <dd className="font-black text-ink">
                    {formatCurrencyFromCents(order.shippingCents)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <dt className="font-semibold text-muted">Tax</dt>
                  <dd className="font-black text-ink">{formatCurrencyFromCents(order.taxCents)}</dd>
                </div>
              </dl>
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-5">
                <p className="text-base font-black text-ink">Total</p>
                <p className="text-2xl font-black text-ink">
                  {formatCurrencyFromCents(order.totalCents)}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}
