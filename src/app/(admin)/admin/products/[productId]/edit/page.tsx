import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateProductAction } from "@/app/(admin)/admin/products/actions";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import {
  getAdminProductById,
  listAdminProductCategories,
  valuesFromProduct,
} from "@/lib/admin-products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit product",
  robots: {
    index: false,
    follow: false,
  },
};

type EditProductPageProps = Readonly<{
  params: Promise<{
    productId: string;
  }>;
}>;

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(productId),
    listAdminProductCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="page-frame">
      <Link
        href="/admin/products"
        className="text-sm font-bold text-electric underline-offset-4 hover:underline"
      >
        Back to products
      </Link>
      <section className="mt-6" aria-labelledby="edit-product-title">
        <p className="eyebrow">Admin</p>
        <h1 id="edit-product-title" className="page-title">
          Edit product
        </h1>
        <p className="page-copy">{product.name}</p>
        <div className="mt-8">
          <AdminProductForm
            action={updateProductAction.bind(null, product.id)}
            categories={categories}
            initialState={{
              status: "idle",
              values: valuesFromProduct(product),
              errors: {},
            }}
            submitLabel="Save product"
          />
        </div>
      </section>
    </div>
  );
}
