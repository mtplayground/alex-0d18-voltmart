export const fallbackProductImage = "/placeholders/catalog/accessories.svg";

export const productAccentByCategory: Record<string, string> = {
  phones: "from-electric/20 via-panel-strong to-sun/25",
  laptops: "from-mint/20 via-panel-strong to-electric/15",
  audio: "from-violet/20 via-panel-strong to-coral/20",
  accessories: "from-coral/20 via-panel-strong to-sun/25",
};

export function getProductImageSrc(imageKey: string | undefined) {
  if (!imageKey) {
    return fallbackProductImage;
  }

  return imageKey.startsWith("/") ? imageKey : `/${imageKey}`;
}

export function getProductAccentClass(categorySlug: string) {
  return productAccentByCategory[categorySlug] ?? productAccentByCategory.accessories;
}
