"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartSummaryResponse = Readonly<{
  itemCount: number;
}>;

export function CartBadge() {
  const [itemCount, setItemCount] = useState(0);
  const label = itemCount === 1 ? "1 item in cart" : `${itemCount} items in cart`;

  useEffect(() => {
    let isMounted = true;

    async function loadCartSummary() {
      try {
        const response = await fetch("/api/cart/summary", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const summary = (await response.json()) as CartSummaryResponse;

        if (isMounted) {
          setItemCount(summary.itemCount);
        }
      } catch {
        if (isMounted) {
          setItemCount(0);
        }
      }
    }

    void loadCartSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Link
      href="/cart"
      aria-label={label}
      className="relative inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-panel-strong px-4 text-sm font-black text-ink shadow-soft transition hover:border-electric/40 hover:text-electric"
    >
      <span aria-hidden="true">Cart</span>
      <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-electric px-2 text-xs font-black text-white">
        {itemCount}
      </span>
    </Link>
  );
}
