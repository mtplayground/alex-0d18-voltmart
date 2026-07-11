"use client";

import Link from "next/link";
import { useEffect } from "react";

type AdminErrorPageProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function AdminErrorPage({ error, reset }: AdminErrorPageProps) {
  useEffect(() => {
    console.error("Admin page error", error);
  }, [error]);

  return (
    <div className="page-frame">
      <section className="surface-card-strong p-8 text-center" role="alert">
        <p className="eyebrow">Admin error</p>
        <h1 className="page-title">Admin view could not load</h1>
        <p className="page-copy mx-auto mt-3 max-w-2xl">
          Try again, or return to a stable admin section to continue reviewing orders and products.
        </p>
        {error.digest ? (
          <p className="mt-4 text-sm font-semibold text-muted">Error reference {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="primary-action px-5 text-base">
            Try again
          </button>
          <Link href="/admin" className="secondary-action px-5 text-base">
            Admin dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
