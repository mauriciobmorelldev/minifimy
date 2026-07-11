export const CACHE_TAGS = {
  home: "home-content",
  products: "fimy-products",
  categories: "fimy-categories",
  checkout: "fimy-checkout",
} as const;

export const CACHE_SECONDS = {
  home: Number(process.env.WORDPRESS_HOME_REVALIDATE_SECONDS ?? 300),
  products: Number(process.env.WOOCOMMERCE_PRODUCTS_REVALIDATE_SECONDS ?? 300),
  categories: Number(process.env.WOOCOMMERCE_CATEGORIES_REVALIDATE_SECONDS ?? 900),
  checkout: Number(process.env.WOOCOMMERCE_CHECKOUT_REVALIDATE_SECONDS ?? 900),
} as const;

export function normalizeBaseUrl(url?: string) {
  return url?.replace(/\/$/, "");
}