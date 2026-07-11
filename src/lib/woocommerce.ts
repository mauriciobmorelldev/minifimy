import type { Category, Product } from "@/models/product";
import { CACHE_SECONDS, CACHE_TAGS, normalizeBaseUrl } from "@/lib/cache";
import { categories as fallbackCategories, products as fallbackProducts } from "@/lib/products";

const WOO_PRODUCT_FIELDS = [
  "id",
  "name",
  "slug",
  "description",
  "short_description",
  "price",
  "regular_price",
  "stock_quantity",
  "stock_status",
  "images",
  "categories",
  "tags",
  "attributes",
  "featured",
].join(",");

const WOO_CATEGORY_FIELDS = ["id", "name", "slug", "description"].join(",");

type WooImage = {
  src?: string;
  alt?: string;
};

type WooCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
};

type WooProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price?: string;
  regular_price?: string;
  stock_quantity?: number | null;
  stock_status?: string;
  images?: WooImage[];
  categories?: WooCategory[];
  tags?: { name?: string; slug?: string }[];
  attributes?: { name?: string; options?: string[] }[];
  featured?: boolean;
};

const STORE_URL = normalizeBaseUrl(process.env.WOOCOMMERCE_URL ?? process.env.WORDPRESS_URL);
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

function canUseWooCommerce() {
  return Boolean(STORE_URL && CONSUMER_KEY && CONSUMER_SECRET);
}

function cleanText(value?: string) {
  return value?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() ?? "";
}

function getSafeImage(src?: string) {
  if (!src) return null;

  try {
    const parsed = new URL(src);
    return ["http:", "https:"].includes(parsed.protocol) ? src : null;
  } catch {
    return src.startsWith("/") ? src : null;
  }
}

function buildWooUrl(path: string, params: Record<string, string | number | boolean> = {}) {
  if (!STORE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) return null;

  const url = new URL(`${STORE_URL}/wp-json/wc/v3/${path}`);
  url.searchParams.set("consumer_key", CONSUMER_KEY);
  url.searchParams.set("consumer_secret", CONSUMER_SECRET);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  return url;
}

function mapWooProduct(product: WooProduct): Product {
  const category = product.categories?.[0]?.slug ?? "catalogo";
  const images = product.images?.map((image) => getSafeImage(image.src)).filter(Boolean) as string[] | undefined;
  const sizes = product.attributes?.find((attribute) =>
    attribute.name?.toLowerCase().includes("talle") || attribute.name?.toLowerCase().includes("size")
  )?.options;
  const colors = product.attributes?.find((attribute) =>
    attribute.name?.toLowerCase().includes("color")
  )?.options;

  return {
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    description: cleanText(product.short_description) || cleanText(product.description),
    price: Number(product.price || product.regular_price || 0),
    images: images && images.length > 0 ? images : ["/products/flatlay-01.jpg"],
    category,
    stock: product.stock_quantity ?? (product.stock_status === "instock" ? 1 : 0),
    badge: product.tags?.[0]?.name,
    sizes,
    colors,
  };
}

function mapWooCategory(category: WooCategory): Category {
  return {
    id: String(category.id),
    name: category.name,
    slug: category.slug,
    description: cleanText(category.description) || `Productos Minifimy de ${category.name}.`,
  };
}

async function fetchWoo<T>(path: string, params: Record<string, string | number | boolean>, revalidate: number, tags: string[]) {
  const url = buildWooUrl(path, params);
  if (!url) return null;

  try {
    const response = await fetch(url, {
      next: { revalidate, tags },
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getStoreProducts(options: { featured?: boolean; category?: string; perPage?: number } = {}) {
  if (!canUseWooCommerce()) return fallbackProducts;

  const data = await fetchWoo<WooProduct[]>(
    "products",
    {
      per_page: options.perPage ?? 24,
      status: "publish",
      stock_status: "instock",
      _fields: WOO_PRODUCT_FIELDS,
      ...(options.featured ? { featured: true } : {}),
      ...(options.category ? { category: options.category } : {}),
    },
    CACHE_SECONDS.products,
    [CACHE_TAGS.products]
  );

  return data?.map(mapWooProduct).filter((product) => product.price > 0) ?? fallbackProducts;
}

export async function getFeaturedStoreProducts() {
  const featured = await getStoreProducts({ featured: true, perPage: 8 });
  if (featured.length > 0 && featured !== fallbackProducts) return featured.slice(0, 6);

  const products = await getStoreProducts({ perPage: 8 });
  return products.slice(0, 6);
}

export async function getStoreCategories() {
  if (!canUseWooCommerce()) return fallbackCategories;

  const data = await fetchWoo<WooCategory[]>(
    "products/categories",
    { per_page: 50, hide_empty: true, _fields: WOO_CATEGORY_FIELDS },
    CACHE_SECONDS.categories,
    [CACHE_TAGS.categories]
  );

  return data?.map(mapWooCategory) ?? fallbackCategories;
}

export async function getStoreProductBySlug(slug: string) {
  const products = await getStoreProducts({ perPage: 100 });
  return products.find((product) => product.slug === slug);
}

export async function getStoreProductsByCategory(slug: string) {
  const allProducts = await getStoreProducts({ perPage: 100 });
  return allProducts.filter((product) => product.category === slug);
}
