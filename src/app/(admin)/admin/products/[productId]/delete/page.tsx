import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteProductAction } from "@/app/(admin)/admin/products/actions";
import { getAdminProductById } from "@/lib/admin-products";
import { formatCurrencyFromCents } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Delete product",
  robots: {
    index: false,
    follow: false,
  },
};

type DeleteProductPageProps = Readonly<{
  params: Promise<{
    productId: string;
  }>;
}>;

export default async function DeleteProductPage({ params }: DeleteProductPageProps) {
  const { productId } = await params;
  const product = await getAdminProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="page-frame">
      <section className="mx-auto max-w-2xl" aria-labelledby="delete-product-title">
        <p className="eyebrow">Admin</p>
        <h1 id="delete-product-title" className="page-title">
          Delete product
        </h1>
        <div className="mt-8 rounded-card border border-coral/30 bg-panel-strong p-6 shadow-soft">
          <h2 className="text-2xl font-black text-ink">{product.name}</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-muted">Category</dt>
              <dd className="font-black text-ink">{product.category.name}</dd>
            </div>
            <div>
              <dt className="font-semibold text-muted">Price</dt>
              <dd className="font-black text-ink">{formatCurrencyFromCents(product.priceCents)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-muted">Slug</dt>
              <dd className="font-black text-ink">{product.slug}</dd>
            </div>
          </dl>
          <p className="mt-5 text-sm leading-6 text-muted">
            Deleting this product removes it from the active catalog. Existing order history keeps
            its product snapshots.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <form action={deleteProductAction.bind(null, product.id)}>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-card bg-coral px-5 text-base font-black text-white transition hover:bg-coral/90"
              >
                Delete product
              </button>
            </form>
            <Link
              href="/admin/products"
              className="inline-flex min-h-12 items-center justify-center rounded-card border border-border bg-panel px-5 text-base font-black text-ink transition hover:border-electric/40 hover:text-electric"
            >
              Cancel
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
