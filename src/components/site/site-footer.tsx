import Link from "next/link";

import { siteConfig } from "@/lib/seo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto flex w-[min(100%-32px,1120px)] flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-black text-ink">{siteConfig.name}</p>
          <p className="mt-1 text-sm font-semibold text-muted">
            Colorful electronics, guest checkout, and order tracking.
          </p>
        </div>
        <nav
          className="flex flex-wrap items-center gap-4 text-sm font-black text-ink"
          aria-label="Footer"
        >
          <Link href="/" className="hover:text-electric">
            Catalog
          </Link>
          <Link href="/cart" className="hover:text-electric">
            Cart
          </Link>
          <Link href="/checkout" className="hover:text-electric">
            Checkout
          </Link>
        </nav>
      </div>
    </footer>
  );
}
