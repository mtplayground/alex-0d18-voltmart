import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="app-shell">
      <div className="page-frame">
        <section className="surface-card-strong p-8 text-center">
          <p className="eyebrow">404</p>
          <h1 className="page-title">Page not found</h1>
          <p className="page-copy mx-auto mt-3 max-w-2xl">
            The page may have moved, or the product or order reference may no longer be available.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="primary-action px-5 text-base">
              Browse catalog
            </Link>
            <Link href="/cart" className="secondary-action px-5 text-base">
              View cart
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
