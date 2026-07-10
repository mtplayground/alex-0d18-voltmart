import Image from "next/image";

import type { ProductWithCategory } from "@/lib/catalog";

type ProductCardProps = Readonly<{
  product: ProductWithCategory;
}>;

const fallbackImage = "/placeholders/catalog/accessories.svg";

const accentByCategory: Record<string, string> = {
  phones: "from-electric/20 via-panel-strong to-sun/25",
  laptops: "from-mint/20 via-panel-strong to-electric/15",
  audio: "from-violet/20 via-panel-strong to-coral/20",
  accessories: "from-coral/20 via-panel-strong to-sun/25",
};

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

function getImageSrc(imageKey: string | undefined) {
  if (!imageKey) {
    return fallbackImage;
  }

  return imageKey.startsWith("/") ? imageKey : `/${imageKey}`;
}

export function ProductCard({ product }: ProductCardProps) {
  const accentClass = accentByCategory[product.category.slug] ?? accentByCategory.accessories;

  return (
    <article className="group flex min-h-[28rem] flex-col overflow-hidden rounded-card border border-border bg-panel-strong shadow-soft transition hover:-translate-y-1 hover:shadow-glow">
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${accentClass}`}>
        <Image
          src={getImageSrc(product.imageKeys[0])}
          alt={`${product.name} placeholder image`}
          fill
          className="object-cover p-5 transition duration-200 group-hover:scale-[1.03]"
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          priority={false}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-electric">{product.category.name}</p>
            <h2 className="mt-2 text-xl font-bold leading-tight text-ink">{product.name}</h2>
          </div>
          <p className="rounded-full bg-sun/30 px-3 py-1 text-sm font-black text-ink">
            {formatPrice(product.priceCents)}
          </p>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span
            className={
              product.inStock
                ? "rounded-full bg-mint/15 px-3 py-1 text-sm font-bold text-ink"
                : "rounded-full bg-coral/15 px-3 py-1 text-sm font-bold text-ink"
            }
          >
            {product.inStock ? "In stock" : "Out of stock"}
          </span>
          <span className="text-sm font-semibold text-muted">Details coming soon</span>
        </div>
      </div>
    </article>
  );
}
