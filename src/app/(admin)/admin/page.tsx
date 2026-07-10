import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { logoutAdmin } from "@/app/(admin)/admin/actions";
import { adminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminHomePage() {
  const cookieStore = await cookies();
  const adminEmail = await verifyAdminSessionToken(cookieStore.get(adminSessionCookieName)?.value);

  return (
    <div className="page-frame">
      <section className="section-panel" aria-labelledby="admin-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-title" className="page-title">
          Admin dashboard
        </h1>
        <p className="page-copy">Protected admin area for managing store operations.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/products"
            className="rounded-card border border-border bg-panel-strong p-5 shadow-soft transition hover:border-electric/40"
          >
            <p className="text-xl font-black text-ink">Products</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Create, edit, and remove catalog products.
            </p>
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-card border border-border bg-panel-strong p-5 shadow-soft transition hover:border-electric/40"
          >
            <p className="text-xl font-black text-ink">Orders</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Review customer details, shipping addresses, and purchased items.
            </p>
          </Link>
        </div>
        <div className="mt-6 flex flex-col gap-4 rounded-card border border-border bg-panel-strong p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Signed in as</p>
            <p className="mt-1 text-lg font-black text-ink">{adminEmail}</p>
          </div>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-card border border-border bg-panel px-4 text-sm font-black text-ink transition hover:border-coral/40 hover:text-coral"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
