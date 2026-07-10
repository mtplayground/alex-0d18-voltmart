import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductBySlug, listProducts } from "@/lib/catalog";
import { formatCurrencyFromCents } from "@/lib/format";
import { getProductAccentClass, getProductImageSrc } from "@/lib/product-images";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 300;

type ProductDetailPageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

export async function generateStaticParams() {
  const products = await listProducts();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const productPath = `/products/${product.slug}`;
  const imageUrl = absoluteUrl(getProductImageSrc(product.imageKeys[0]));

  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical: productPath,
    },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description,
      url: productPath,
      images: [
        {
          url: imageUrl,
          width: 640,
          height: 480,
          alt: `${product.name} product image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const imageSrc = getProductImageSrc(product.imageKeys[0]);
  const accentClass = getProductAccentClass(product.category.slug);

  return (
    <main className="app-shell">
      <div className="page-frame">
        <Link
          href={`/?category=${encodeURIComponent(product.category.slug)}`}
          className="text-sm font-bold text-electric underline-offset-4 hover:underline"
        >
          Back to {product.category.name}
        </Link>

        <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] lg:items-start">
          <div
            className={`relative aspect-[4/3] overflow-hidden rounded-card bg-gradient-to-br ${accentClass}`}
          >
            <Image
              src={imageSrc}
              alt={`${product.name} product image`}
              fill
              className="object-cover p-8"
              sizes="(min-width: 1024px) 58vw, 100vw"
              priority
            />
          </div>

          <section
            aria-labelledby="product-title"
            className="rounded-card bg-panel-strong p-6 shadow-soft"
          >
            <p className="eyebrow">{product.category.name}</p>
            <h1 id="product-title" className="text-4xl font-black leading-tight text-ink">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-black text-ink">
              {formatCurrencyFromCents(product.priceCents)}
            </p>
            <p className="mt-5 text-base leading-7 text-muted">{product.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span
                className={
                  product.inStock
                    ? "rounded-full bg-mint/15 px-3 py-1 text-sm font-bold text-ink"
                    : "rounded-full bg-coral/15 px-3 py-1 text-sm font-bold text-ink"
                }
              >
                {product.inStock ? "In stock" : "Out of stock"}
              </span>
              <span className="rounded-full bg-sun/25 px-3 py-1 text-sm font-bold text-ink">
                {product.imageKeys.length} image
                {product.imageKeys.length === 1 ? "" : "s"}
              </span>
            </div>

            <form className="mt-8">
              <button
                type="button"
                disabled={!product.inStock}
                className="min-h-12 w-full rounded-card bg-electric px-5 text-base font-black text-white shadow-glow transition hover:bg-violet disabled:cursor-not-allowed disabled:bg-muted disabled:shadow-none"
              >
                Add to cart
              </button>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}
