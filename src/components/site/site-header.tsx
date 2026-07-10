import Link from "next/link";

import { CartBadge } from "@/components/site/cart-badge";
import { siteConfig } from "@/lib/seo";

export function SiteHeader() {
  return (
    <header className="border-b border-border/80 bg-panel/80 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-[min(100%-32px,1120px)] items-center justify-between gap-4">
        <Link href="/" className="flex flex-col leading-tight text-ink hover:text-electric">
          <span className="text-lg font-black">{siteConfig.name}</span>
          <span className="text-xs font-bold uppercase text-muted">Electronics catalog</span>
        </Link>
        <nav className="flex items-center gap-3" aria-label="Primary navigation">
          <Link
            href="/"
            className="hidden min-h-10 items-center rounded-full px-3 text-sm font-bold text-muted transition hover:text-electric sm:inline-flex"
          >
            Catalog
          </Link>
          <CartBadge />
        </nav>
      </div>
    </header>
  );
}
