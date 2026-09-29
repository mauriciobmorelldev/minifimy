import type { MetadataRoute } from "next";
import { getStoreCategories, getStoreProductSitemapSlugs } from "@/lib/woocommerce";

const baseUrl = "https://minifimy.com";
const staticPaths = [
  "/",
  "/catalogo",
  "/envios-y-cambios",
  "/contacto",
  "/legales",
  "/privacidad",
  "/cookies",
];

export const revalidate = 900;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: new URL(path, baseUrl).toString(),
  }));

  // The fallback catalog contains demo products. Publish catalog URLs only when
  // the live WooCommerce connection is configured.
  const hasStore = Boolean(
    (process.env.WOOCOMMERCE_URL ?? process.env.WORDPRESS_URL) &&
      process.env.WOOCOMMERCE_CONSUMER_KEY &&
      process.env.WOOCOMMERCE_CONSUMER_SECRET,
  );
  if (!hasStore) return urls;

  const [categories, productSlugs] = await Promise.all([
    getStoreCategories(),
    getStoreProductSitemapSlugs(),
  ]);

  for (const category of categories) {
    if (category.slug && category.slug !== "sin-categorizar") {
      urls.push({ url: new URL(`/catalogo/${encodeURIComponent(category.slug)}`, baseUrl).toString() });
    }
  }

  for (const slug of productSlugs) {
    urls.push({ url: new URL(`/producto/${encodeURIComponent(slug)}`, baseUrl).toString() });
  }

  return urls;
}
