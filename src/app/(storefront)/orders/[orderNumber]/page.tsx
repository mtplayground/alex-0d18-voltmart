import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { formatCurrencyFromCents } from "@/lib/format";
import { getProductImageSrc } from "@/lib/product-images";

export const dynamic = "force-dynamic";

type OrderConfirmationPageProps = Readonly<{
  params: Promise<{
    orderNumber: string;
  }>;
}>;

async function getOrder(orderNumber: string) {
  return prisma.order.findUnique({
    where: {
      orderNumber,
    },
    include: {
      items: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function generateMetadata({ params }: OrderConfirmationPageProps): Promise<Metadata> {
  const { orderNumber } = await params;

  return {
    title: `Order ${orderNumber}`,
    description: "Order confirmation and summary.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);

  if (!order) {
    notFound();
  }

  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
  const placedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(order.createdAt);

  return (
    <main className="app-shell">
      <div className="page-frame">
        <section aria-labelledby="confirmation-title">
          <div className="hero-band">
            <p className="eyebrow">Order confirmed</p>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 id="confirmation-title" className="page-title">
                  Thanks, {order.customerName}
                </h1>
                <p className="page-copy">
                  Your order was submitted. Keep this reference for your records.
                </p>
              </div>
              <Link href="/" className="secondary-action px-4 text-sm">
                Continue shopping
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <section
              aria-label="Order items"
              className="surface-card-strong p-5"
            >
              <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted">Order reference</p>
                  <p className="mt-1 text-2xl font-black text-ink">{order.orderNumber}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold text-muted">Submitted</p>
                  <p className="mt-1 text-sm font-black text-ink">{placedAt}</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {order.items.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-4 rounded-card border border-white/80 bg-white/70 p-4 sm:grid-cols-[96px_minmax(0,1fr)]"
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
              <section className="surface-card-strong p-5">
                <h2 className="text-xl font-black text-ink">Summary</h2>
                <dl className="mt-5 space-y-3">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <dt className="font-semibold text-muted">Items</dt>
                    <dd className="font-black text-ink">{itemCount}</dd>
                  </div>
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
                    <dd className="font-black text-ink">
                      {formatCurrencyFromCents(order.taxCents)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 border-t border-border pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-base font-black text-ink">Total</p>
                    <p className="text-2xl font-black text-ink">
                      {formatCurrencyFromCents(order.totalCents)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Status: <span className="font-black text-ink">{order.status}</span>
                  </p>
                </div>
              </section>

              <section className="surface-card-strong p-5">
                <h2 className="text-xl font-black text-ink">Delivery details</h2>
                <div className="mt-4 space-y-4 text-sm leading-6">
                  <div>
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
                  <div className="border-t border-border pt-4">
                    <p className="font-black text-ink">{order.customerEmail}</p>
                    {order.customerPhone ? (
                      <p className="text-muted">{order.customerPhone}</p>
                    ) : null}
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
