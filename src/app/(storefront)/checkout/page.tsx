import type { Metadata } from "next";
import Link from "next/link";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { EmptyState } from "@/components/ui/empty-state";
import { getCartBySessionId } from "@/lib/cart";
import { getCartSessionId } from "@/lib/cart-session";
import { getCartItemCount, getCartSubtotalCents } from "@/lib/cart-summary";
import { formatCurrencyFromCents } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter guest checkout contact and shipping details.",
  openGraph: {
    title: "Checkout",
    description: "Enter guest checkout contact and shipping details.",
  },
};

export default async function CheckoutPage() {
  const sessionId = await getCartSessionId();
  const cart = await getCartBySessionId(sessionId ?? undefined);
  const itemCount = getCartItemCount(cart);
  const subtotalCents = getCartSubtotalCents(cart);
  const hasItems = Boolean(cart && cart.items.length > 0);

  return (
    <main className="app-shell">
      <div className="page-frame">
        <section aria-labelledby="checkout-title">
          <div className="hero-band">
            <p className="eyebrow">Checkout</p>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 id="checkout-title" className="page-title">
                  Guest checkout
                </h1>
                <p className="page-copy">
                  Enter contact and shipping details for the current cart. No payment is collected.
                </p>
              </div>
              <Link href="/cart" className="secondary-action px-4 text-sm">
                Back to cart
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            {hasItems ? (
              <CheckoutForm disabled={false} />
            ) : (
              <EmptyState
                title="Your cart is empty"
                action={
                  <Link href="/" className="primary-action px-5 text-base">
                    Continue shopping
                  </Link>
                }
                className=""
              >
                <p>Add items to your cart before entering checkout details.</p>
              </EmptyState>
            )}

            <aside className="surface-card-strong p-5">
              <h2 className="text-xl font-black text-ink">Order summary</h2>
              <dl className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <dt className="font-semibold text-muted">Items</dt>
                  <dd className="font-black text-ink">{itemCount}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <dt className="font-semibold text-muted">Subtotal</dt>
                  <dd className="font-black text-ink">{formatCurrencyFromCents(subtotalCents)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <dt className="font-semibold text-muted">Payment due</dt>
                  <dd className="font-black text-ink">{formatCurrencyFromCents(0)}</dd>
                </div>
              </dl>
              <div className="mt-5 border-t border-border pt-5">
                <p className="text-sm leading-6 text-muted">
                  This checkout collects delivery details only; no payment is collected.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
