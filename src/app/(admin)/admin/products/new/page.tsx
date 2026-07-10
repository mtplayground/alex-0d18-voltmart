import type { Metadata } from "next";
import Link from "next/link";

import { createProductAction } from "@/app/(admin)/admin/products/actions";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import { initialProductFormState, listAdminProductCategories } from "@/lib/admin-products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New product",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewProductPage() {
  const categories = await listAdminProductCategories();

  return (
    <div className="page-frame">
      <Link
        href="/admin/products"
        className="text-sm font-bold text-electric underline-offset-4 hover:underline"
      >
        Back to products
      </Link>
      <section className="mt-6" aria-labelledby="new-product-title">
        <p className="eyebrow">Admin</p>
        <h1 id="new-product-title" className="page-title">
          New product
        </h1>
        <p className="page-copy">Create a catalog product with pricing, stock, and images.</p>
        <div className="mt-8">
          <AdminProductForm
            action={createProductAction}
            categories={categories}
            initialState={initialProductFormState}
            submitLabel="Create product"
          />
        </div>
      </section>
    </div>
  );
}
