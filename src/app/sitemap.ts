import type { MetadataRoute } from "next";
import { getStoreCategories, getStoreProductCollection } from "@/lib/woocommerce";

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

  const [categories, firstPage] = await Promise.all([
    getStoreCategories(),
    getStoreProductCollection({ page: 1, perPage: 100 }),
  ]);

  for (const category of categories) {
    if (category.slug && category.slug !== "sin-categorizar") {
      urls.push({ url: new URL(`/catalogo/${encodeURIComponent(category.slug)}`, baseUrl).toString() });
    }
  }

  const seen = new Set<string>();
  const addProducts = (products: typeof firstPage.products) => {
    for (const product of products) {
      if (!product.slug || seen.has(product.slug)) continue;
      seen.add(product.slug);
      urls.push({ url: new URL(`/producto/${encodeURIComponent(product.slug)}`, baseUrl).toString() });
    }
  };

  addProducts(firstPage.products);
  for (let page = 2; page <= firstPage.totalPages; page++) {
    const collection = await getStoreProductCollection({ page, perPage: 100 });
    addProducts(collection.products);
  }

  return urls;
}
