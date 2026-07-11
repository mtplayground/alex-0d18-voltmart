import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrencyFromCents } from "@/lib/format";
import { listAdminProducts } from "@/lib/admin-products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <div className="page-frame">
      <section aria-labelledby="admin-products-title">
        <p className="eyebrow">Admin</p>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 id="admin-products-title" className="page-title">
              Products
            </h1>
            <p className="page-copy">Create, edit, and remove catalog products.</p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex min-h-12 items-center justify-center rounded-card bg-electric px-5 text-base font-black text-white shadow-glow transition hover:bg-violet"
          >
            New product
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="mt-8 overflow-hidden rounded-card border border-border bg-panel-strong shadow-soft">
            <div className="grid grid-cols-[minmax(0,1fr)_140px_130px_170px] gap-4 border-b border-border px-5 py-3 text-sm font-black text-muted">
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_140px_130px_170px] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-black text-ink">{product.name}</h2>
                      <span
                        className={
                          product.isActive
                            ? "rounded-full bg-mint/15 px-2 py-1 text-xs font-bold text-ink"
                            : "rounded-full bg-coral/15 px-2 py-1 text-xs font-bold text-ink"
                        }
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={
                          product.inStock
                            ? "rounded-full bg-sun/25 px-2 py-1 text-xs font-bold text-ink"
                            : "rounded-full bg-border px-2 py-1 text-xs font-bold text-muted"
                        }
                      >
                        {product.inStock ? "In stock" : "Out of stock"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-muted">
                      /products/{product.slug}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-ink">{product.category.name}</p>
                  <p className="text-sm font-black text-ink">
                    {formatCurrencyFromCents(product.priceCents)}
                  </p>
                  <div className="flex items-center gap-3 md:justify-end">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm font-bold text-muted underline-offset-4 hover:text-electric hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-sm font-bold text-electric underline-offset-4 hover:underline"
                    >
                      Edit
                    </Link>
                    {product.isActive ? (
                      <Link
                        href={`/admin/products/${product.id}/delete`}
                        className="text-sm font-bold text-coral underline-offset-4 hover:underline"
                      >
                        Delete
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No products yet"
            action={
              <Link
                href="/admin/products/new"
                className="inline-flex min-h-12 items-center rounded-card bg-electric px-5 text-base font-black text-white shadow-glow transition hover:bg-violet"
              >
                New product
              </Link>
            }
            className="mt-8 border-dashed border-border bg-panel-strong shadow-soft"
          >
            <p>
              Add the first catalog item and it will appear in the storefront.
            </p>
          </EmptyState>
        )}
      </section>
    </div>
  );
}
