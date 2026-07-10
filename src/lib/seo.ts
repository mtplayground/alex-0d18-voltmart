export const siteConfig = {
  name: "Storefront",
  title: "Storefront",
  description: "A colorful storefront experience for browsing products and placing orders.",
  locale: "en_US",
};

const localOrigin = "http://localhost:8080";

function normalizeOrigin(origin: string) {
  return origin.endsWith("/") ? origin.slice(0, -1) : origin;
}

export function getSiteUrl() {
  const configuredOrigin = process.env.SELF_URL ?? process.env.ALLOWED_CORS_ORIGIN ?? localOrigin;

  try {
    return new URL(normalizeOrigin(configuredOrigin));
  } catch {
    throw new Error("SELF_URL must be a valid absolute URL when provided");
  }
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}
