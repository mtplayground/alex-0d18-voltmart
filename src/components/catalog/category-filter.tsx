import type { Category } from "@prisma/client";
import Link from "next/link";

type CategoryFilterProps = Readonly<{
  categories: Pick<Category, "name" | "slug">[];
  selectedCategorySlug?: string;
}>;

function getCategoryHref(slug?: string) {
  return slug ? `/?category=${encodeURIComponent(slug)}` : "/";
}

export function CategoryFilter({ categories, selectedCategorySlug }: CategoryFilterProps) {
  return (
    <nav className="mt-8" aria-label="Catalog categories">
      <ul className="flex flex-wrap gap-3">
        <li>
          <Link
            href={getCategoryHref()}
            aria-current={selectedCategorySlug ? undefined : "page"}
            className={
              selectedCategorySlug
                ? "inline-flex min-h-11 items-center rounded-full border border-white/80 bg-white/90 px-4 text-sm font-bold text-ink shadow-[0_10px_24px_rgb(23_32_51_/_0.08)] transition hover:border-electric/40 hover:text-electric"
                : "inline-flex min-h-11 items-center rounded-full border border-white/70 bg-[linear-gradient(135deg,#1f57e7,#6d28d9,#c93445)] px-4 text-sm font-black text-white shadow-glow"
            }
          >
            All
          </Link>
        </li>
        {categories.map((category) => {
          const isSelected = category.slug === selectedCategorySlug;

          return (
            <li key={category.slug}>
              <Link
                href={getCategoryHref(category.slug)}
                aria-current={isSelected ? "page" : undefined}
                className={
                  isSelected
                    ? "inline-flex min-h-11 items-center rounded-full border border-white/70 bg-[linear-gradient(135deg,#1f57e7,#6d28d9,#c93445)] px-4 text-sm font-black text-white shadow-glow"
                    : "inline-flex min-h-11 items-center rounded-full border border-white/80 bg-white/90 px-4 text-sm font-bold text-ink shadow-[0_10px_24px_rgb(23_32_51_/_0.08)] transition hover:border-electric/40 hover:text-electric"
                }
              >
                {category.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
