import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  submitCartItemQuantityUpdate,
  submitCartItemRemoval,
} from "@/app/(storefront)/cart/actions";
import { EmptyState } from "@/components/ui/empty-state";
import { getCartBySessionId } from "@/lib/cart";
import { maxCartItemQuantity } from "@/lib/cart-actions";
import { getCartSessionId } from "@/lib/cart-session";
import { formatCurrencyFromCents } from "@/lib/format";
import { getCartItemCount, getCartLineTotalCents, getCartSubtotalCents } from "@/lib/cart-summary";
import { getProductImageSrc } from "@/lib/product-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review cart items and update quantities before checkout.",
  openGraph: {
    title: "Cart",
    description: "Review cart items and update quantities before checkout.",
  },
};

export default async function CartPage() {
  const sessionId = await getCartSessionId();
  const cart = await getCartBySessionId(sessionId ?? undefined);
  const itemCount = getCartItemCount(cart);
  const subtotalCents = getCartSubtotalCents(cart);

  return (
    <main className="app-shell">
      <div className="page-frame">
        <section aria-labelledby="cart-title">
          <div className="hero-band">
            <p className="eyebrow">Cart</p>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 id="cart-title" className="page-title">
                  Shopping cart
                </h1>
                <p className="page-copy">
                  Review selected electronics, adjust quantities, and continue to checkout.
                </p>
              </div>
              <p className="count-pill">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
            </div>
          </div>

          {cart && cart.items.length > 0 ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <section aria-label="Cart items" className="space-y-4">
                {cart.items.map((item) => {
                  const product = item.product;
                  const lineTotalCents = getCartLineTotalCents(item);

                  return (
                    <article
                      key={item.id}
                      className="surface-card grid gap-4 p-4 sm:grid-cols-[140px_minmax(0,1fr)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-canvas">
                        <Image
                          src={getProductImageSrc(product.imageKeys[0])}
                          alt={`${product.name} product image`}
                          fill
                          className="object-cover p-4"
                          sizes="140px"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase text-electric">
                              {product.category.name}
                            </p>
                            <Link
                              href={`/products/${product.slug}`}
                              className="mt-1 block text-xl font-black text-ink hover:text-electric"
                            >
                              {product.name}
                            </Link>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                              {product.description}
                            </p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-sm font-semibold text-muted">Line total</p>
                            <p className="text-xl font-black text-ink">
                              {formatCurrencyFromCents(lineTotalCents)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center rounded-full border border-white/80 bg-white/90 px-2 py-1">
                            <form
                              action={submitCartItemQuantityUpdate.bind(
                                null,
                                product.id,
                                item.quantity - 1,
                              )}
                            >
                              <button
                                type="submit"
                                disabled={item.quantity <= 1}
                                aria-label={`Decrease quantity for ${product.name}`}
                                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-lg font-black text-ink transition hover:bg-sun/30 disabled:cursor-not-allowed disabled:text-muted"
                              >
                                -
                              </button>
                            </form>
                            <span className="min-w-10 text-center text-sm font-black text-ink">
                              {item.quantity}
                            </span>
                            <form
                              action={submitCartItemQuantityUpdate.bind(
                                null,
                                product.id,
                                item.quantity + 1,
                              )}
                            >
                              <button
                                type="submit"
                                disabled={item.quantity >= maxCartItemQuantity}
                                aria-label={`Increase quantity for ${product.name}`}
                                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-lg font-black text-ink transition hover:bg-mint/20 disabled:cursor-not-allowed disabled:text-muted"
                              >
                                +
                              </button>
                            </form>
                          </div>

                          <div className="flex items-center gap-4">
                            <p className="text-sm font-semibold text-muted">
                              {formatCurrencyFromCents(product.priceCents)} each
                            </p>
                            <form action={submitCartItemRemoval.bind(null, product.id)}>
                              <button
                                type="submit"
                                className="min-h-11 px-1 text-sm font-black text-coral underline-offset-4 hover:underline"
                              >
                                Remove
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>

              <aside className="surface-card-strong p-5">
                <h2 className="text-xl font-black text-ink">Order summary</h2>
                <dl className="mt-5 space-y-3">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <dt className="font-semibold text-muted">Items</dt>
                    <dd className="font-black text-ink">{itemCount}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <dt className="font-semibold text-muted">Subtotal</dt>
                    <dd className="font-black text-ink">
                      {formatCurrencyFromCents(subtotalCents)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 border-t border-border pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-base font-black text-ink">Total</p>
                    <p className="text-2xl font-black text-ink">
                      {formatCurrencyFromCents(subtotalCents)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Taxes, shipping, and contact details are collected during checkout.
                  </p>
                </div>
                <Link
                  href="/checkout"
                  className="primary-action mt-6 w-full px-5 text-base"
                >
                  Proceed to checkout
                </Link>
              </aside>
            </div>
          ) : (
            <EmptyState
              title="Your cart is empty"
              action={
                <Link href="/" className="primary-action px-5 text-base">
                  Continue shopping
                </Link>
              }
            >
              <p>
                Add electronics from the catalog and they will stay here for your current shopping
                session.
              </p>
            </EmptyState>
          )}
        </section>
      </div>
    </main>
  );
}
