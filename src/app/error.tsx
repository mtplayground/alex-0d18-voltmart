"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Storefront page error", error);
  }, [error]);

  return (
    <main className="app-shell">
      <div className="page-frame">
        <section className="surface-card-strong p-8 text-center" role="alert">
          <p className="eyebrow">Something went wrong</p>
          <h1 className="page-title">We could not load this page</h1>
          <p className="page-copy mx-auto mt-3 max-w-2xl">
            Refresh the page or return to the catalog. Your cart is saved to the current browser
            session.
          </p>
          {error.digest ? (
            <p className="mt-4 text-sm font-semibold text-muted">Error reference {error.digest}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="primary-action px-5 text-base">
              Try again
            </button>
            <Link href="/" className="secondary-action px-5 text-base">
              Back to catalog
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
