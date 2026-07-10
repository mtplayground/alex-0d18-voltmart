import Link from "next/link";

import { CartBadge } from "@/components/site/cart-badge";
import { siteConfig } from "@/lib/seo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-panel/75 shadow-[0_12px_36px_rgb(23_32_51_/_0.08)] backdrop-blur-xl">
      <div className="h-1 bg-[linear-gradient(90deg,#2364ff,#16c79a,#ffca3a,#ff5a5f)]" />
      <div className="mx-auto flex min-h-20 w-[min(100%-32px,1120px)] items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 leading-tight text-ink hover:text-electric"
        >
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-card bg-[linear-gradient(135deg,#1f57e7,#6d28d9_52%,#c93445)] text-base font-black text-white shadow-glow"
            aria-hidden="true"
          >
            S
          </span>
          <span className="flex flex-col">
            <span className="text-lg font-black">{siteConfig.name}</span>
            <span className="text-xs font-bold uppercase text-muted">Electronics catalog</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3" aria-label="Primary navigation">
          <Link
            href="/"
            className="hidden min-h-10 items-center rounded-full bg-white/70 px-3 text-sm font-black text-ink transition hover:text-electric sm:inline-flex"
          >
            Catalog
          </Link>
          <CartBadge />
        </nav>
      </div>
    </header>
  );
}
