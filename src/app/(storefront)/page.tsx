import type { Metadata } from "next";

import { CategoryFilter } from "@/components/catalog/category-filter";
import { ProductCard } from "@/components/catalog/product-card";
import { listCategories, listProducts } from "@/lib/catalog";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browse the product catalog by category.",
  openGraph: {
    title: "Catalog",
    description: "Browse the product catalog by category.",
  },
};

type CatalogPageProps = Readonly<{
  searchParams?: Promise<{
    category?: string | string[];
  }>;
}>;

function getSelectedCategorySlug(category: string | string[] | undefined) {
  const value = Array.isArray(category) ? category[0] : category;
  const normalizedValue = value?.trim();

  return normalizedValue || undefined;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedCategorySlug = getSelectedCategorySlug(resolvedSearchParams?.category);

  const [categories, products] = await Promise.all([
    listCategories(),
    listProducts({ categorySlug: selectedCategorySlug }),
  ]);

  const selectedCategory = categories.find((category) => category.slug === selectedCategorySlug);
  const heading = selectedCategory ? selectedCategory.name : "Catalog";
  const productLabel = products.length === 1 ? "product" : "products";

  return (
    <main className="app-shell">
      <div className="page-frame">
        <section aria-labelledby="catalog-title">
          <div className="hero-band">
            <p className="eyebrow">Storefront</p>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 id="catalog-title" className="page-title">
                  {heading}
                </h1>
                <p className="page-copy">
                  Browse colorful electronics across phones, laptops, audio, and accessories.
                </p>
              </div>
              <p className="count-pill">{products.length} {productLabel}</p>
            </div>

            <CategoryFilter categories={categories} selectedCategorySlug={selectedCategorySlug} />
          </div>

          {products.length > 0 ? (
            <section
              aria-label="Product catalog"
              className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </section>
          ) : (
            <section
              className="surface-card mt-8 p-8 text-center"
              aria-live="polite"
            >
              <h2 className="text-xl font-bold text-ink">No products found</h2>
              <p className="mx-auto mt-2 max-w-xl text-muted">
                There are no active products in this category yet. Choose another category to keep
                browsing.
              </p>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
