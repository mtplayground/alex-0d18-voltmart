import type { OrderStatus } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";

import { listAdminOrders } from "@/lib/admin-orders";
import { formatCurrencyFromCents } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
  robots: {
    index: false,
    follow: false,
  },
};

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

export default async function AdminOrdersPage() {
  const orders = await listAdminOrders();

  return (
    <div className="page-frame">
      <section aria-labelledby="admin-orders-title">
        <p className="eyebrow">Admin</p>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 id="admin-orders-title" className="page-title">
              Orders
            </h1>
            <p className="page-copy">Review customer orders, shipping details, and line items.</p>
          </div>
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center justify-center rounded-card border border-border bg-panel-strong px-4 text-sm font-black text-ink shadow-soft transition hover:border-electric/40 hover:text-electric"
          >
            Admin dashboard
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="mt-8 overflow-hidden rounded-card border border-border bg-panel-strong shadow-soft">
            <div className="grid grid-cols-[minmax(0,1fr)_150px_140px_120px_120px] gap-4 border-b border-border px-5 py-3 text-sm font-black text-muted">
              <span>Order</span>
              <span>Customer</span>
              <span>Submitted</span>
              <span>Status</span>
              <span className="text-right">Total</span>
            </div>
            <div className="divide-y divide-border">
              {orders.map((order) => {
                const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

                return (
                  <article
                    key={order.id}
                    className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_150px_140px_120px_120px] md:items-center"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/orders/${order.orderNumber}`}
                        className="text-lg font-black text-ink hover:text-electric"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="mt-1 text-sm font-semibold text-muted">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-ink">{order.customerName}</p>
                      <p className="truncate text-sm font-semibold text-muted">
                        {order.customerEmail}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-ink">{formatOrderDate(order.createdAt)}</p>
                    <p>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${statusClassName(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </p>
                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <p className="text-sm font-black text-ink">
                        {formatCurrencyFromCents(order.totalCents)}
                      </p>
                      <Link
                        href={`/admin/orders/${order.orderNumber}`}
                        className="text-sm font-bold text-electric underline-offset-4 hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <section className="mt-8 rounded-card border border-dashed border-border bg-panel-strong p-8 text-center shadow-soft">
            <h2 className="text-2xl font-black text-ink">No orders yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Submitted guest checkout orders will appear here newest first.
            </p>
          </section>
        )}
      </section>
    </div>
  );
}
