import Image from "next/image";
import Link from "next/link";

import type { ProductWithCategory } from "@/lib/catalog";
import { formatCurrencyFromCents } from "@/lib/format";
import { getProductAccentClass, getProductImageSrc } from "@/lib/product-images";

type ProductCardProps = Readonly<{
  product: ProductWithCategory;
}>;

export function ProductCard({ product }: ProductCardProps) {
  const accentClass = getProductAccentClass(product.category.slug);

  return (
    <article className="surface-card-strong group flex min-h-[28rem] flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-glow">
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${accentClass}`}>
        <Image
          src={getProductImageSrc(product.imageKeys[0])}
          alt={`${product.name} placeholder image`}
          fill
          className="object-cover p-5 transition duration-200 group-hover:scale-[1.03]"
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          priority={false}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-electric">{product.category.name}</p>
            <h2 className="mt-2 text-xl font-bold leading-tight text-ink">{product.name}</h2>
          </div>
          <p className="w-fit shrink-0 rounded-full bg-sun/30 px-3 py-1 text-sm font-black text-ink">
            {formatCurrencyFromCents(product.priceCents)}
          </p>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{product.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <span
            className={
              product.inStock
                ? "rounded-full bg-mint/15 px-3 py-1 text-sm font-bold text-ink"
                : "rounded-full bg-coral/15 px-3 py-1 text-sm font-bold text-ink"
            }
          >
            {product.inStock ? "In stock" : "Out of stock"}
          </span>
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-black text-electric underline-offset-4 hover:underline"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
