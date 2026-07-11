import type { Category, Product, ProductFilterOptions } from "@/models/product";
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


export interface StorePaymentMethod {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface StoreShippingMethod {
  id: string;
  methodId: string;
  title: string;
  description: string;
  total: number;
  zoneId?: number;
  instanceId?: number;
}

export interface StoreCheckoutItem {
  productId: string;
  quantity: number;
  selection?: {
    size?: string;
    color?: string;
  };
}

export interface StoreCheckoutCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
}

export interface CreateStoreOrderInput {
  customer: StoreCheckoutCustomer;
  items: StoreCheckoutItem[];
  paymentMethodId: string;
  shippingMethodId: string;
}

type WooPaymentGateway = {
  id: string;
  title?: string;
  description?: string;
  enabled?: boolean;
};

type WooShippingZone = {
  id: number;
  name?: string;
};

type WooShippingZoneMethod = {
  id: string;
  instance_id?: number;
  title?: string;
  method_title?: string;
  enabled?: boolean;
  settings?: Record<string, { value?: string }>;
};

type WooProductAttribute = {
  id: number;
  name: string;
  slug: string;
};

type WooProductAttributeTerm = {
  id: number;
  name: string;
  slug: string;
};

type WooOrder = {
  id: number;
  order_key?: string;
  payment_url?: string;
  checkout_payment_url?: string;
};

function buildWooOrderPayUrl(order: WooOrder) {
  if (!STORE_URL || !order.order_key) return undefined;

  const url = new URL(`${STORE_URL}/checkout/order-pay/${order.id}/`);
  url.searchParams.set("pay_for_order", "true");
  url.searchParams.set("key", order.order_key);
  return url.toString();
}

function getSettingNumber(value?: string) {
  const normalized = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(normalized) ? normalized : 0;
}

async function postWoo<T>(path: string, body: unknown) {
  const url = buildWooUrl(path);
  if (!url) return null;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`WooCommerce POST ${path} failed`, response.status, detail);
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

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

function normalizeFilterName(value?: string) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function getUniqueSortedValues(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => cleanText(value)).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

function buildFilterOptionsFromProducts(products: Product[], categories: Category[]): ProductFilterOptions {
  const prices = products.map((product) => product.price).filter((price) => Number.isFinite(price) && price > 0);

  return {
    categories,
    sizes: getUniqueSortedValues(products.flatMap((product) => product.sizes ?? [])),
    colors: getUniqueSortedValues(products.flatMap((product) => product.colors ?? [])),
    price: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    },
  };
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

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`WooCommerce POST ${path} failed`, response.status, detail);
      return null;
    }

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

async function getWooAttributeTerms(attribute: WooProductAttribute | undefined) {
  if (!attribute) return [];

  const terms = await fetchWoo<WooProductAttributeTerm[]>(
    `products/attributes/${attribute.id}/terms`,
    { per_page: 100 },
    CACHE_SECONDS.categories,
    [CACHE_TAGS.categories]
  );

  return getUniqueSortedValues((terms ?? []).map((term) => term.name));
}

export async function getStoreProductFilters(): Promise<ProductFilterOptions> {
  const [products, categories] = await Promise.all([
    getStoreProducts({ perPage: 100 }),
    getStoreCategories(),
  ]);

  if (!canUseWooCommerce()) {
    return buildFilterOptionsFromProducts(products, categories);
  }

  const attributes = await fetchWoo<WooProductAttribute[]>(
    "products/attributes",
    { per_page: 100 },
    CACHE_SECONDS.categories,
    [CACHE_TAGS.categories]
  );

  const sizeAttribute = (attributes ?? []).find((attribute) => {
    const name = normalizeFilterName(`${attribute.name} ${attribute.slug}`);
    return name.includes("talle") || name.includes("size") || name.includes("edad");
  });
  const colorAttribute = (attributes ?? []).find((attribute) => {
    const name = normalizeFilterName(`${attribute.name} ${attribute.slug}`);
    return name.includes("color") || name.includes("tono");
  });

  const [sizesFromWoo, colorsFromWoo] = await Promise.all([
    getWooAttributeTerms(sizeAttribute),
    getWooAttributeTerms(colorAttribute),
  ]);
  const fallback = buildFilterOptionsFromProducts(products, categories);

  return {
    categories,
    sizes: sizesFromWoo.length > 0 ? sizesFromWoo : fallback.sizes,
    colors: colorsFromWoo.length > 0 ? colorsFromWoo : fallback.colors,
    price: fallback.price,
  };
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
  if (!canUseWooCommerce()) {
    return fallbackProducts.find((product) => product.slug === slug);
  }

  const data = await fetchWoo<WooProduct[]>(
    "products",
    {
      slug,
      per_page: 1,
      status: "publish",
      _fields: WOO_PRODUCT_FIELDS,
    },
    CACHE_SECONDS.products,
    [CACHE_TAGS.products]
  );

  return data?.[0] ? mapWooProduct(data[0]) : undefined;
}

export async function getStoreProductsByCategory(slug: string) {
  const allProducts = await getStoreProducts({ perPage: 100 });
  return allProducts.filter((product) => product.category === slug);
}

export async function getStorePaymentMethods(): Promise<StorePaymentMethod[]> {
  if (!canUseWooCommerce()) {
    return [{ id: "cod", title: "Pago a coordinar", description: "Confirmamos el pago por WhatsApp.", enabled: true }];
  }

  const data = await fetchWoo<WooPaymentGateway[]>(
    "payment_gateways",
    {},
    CACHE_SECONDS.checkout,
    [CACHE_TAGS.checkout]
  );

  return (data ?? [])
    .filter((method) => method.enabled)
    .map((method) => ({
      id: method.id,
      title: cleanText(method.title) || method.id,
      description: cleanText(method.description),
      enabled: Boolean(method.enabled),
    }));
}

export async function getStoreShippingMethods(): Promise<StoreShippingMethod[]> {
  if (!canUseWooCommerce()) {
    return [{ id: "fallback:flat_rate", methodId: "flat_rate", title: "Envio estimado", description: "A coordinar", total: 950 }];
  }

  const zones = await fetchWoo<WooShippingZone[]>(
    "shipping/zones",
    {},
    CACHE_SECONDS.checkout,
    [CACHE_TAGS.checkout]
  );

  const methodsByZone = await Promise.all(
    (zones ?? []).map(async (zone) => {
      const methods = await fetchWoo<WooShippingZoneMethod[]>(
        `shipping/zones/${zone.id}/methods`,
        {},
        CACHE_SECONDS.checkout,
        [CACHE_TAGS.checkout]
      );

      return (methods ?? [])
        .filter((method) => method.enabled)
        .map((method) => ({
          id: `${zone.id}:${method.id}:${method.instance_id ?? "default"}`,
          methodId: method.id,
          title: cleanText(method.title || method.method_title) || "Envio",
          description: cleanText(zone.name),
          total: getSettingNumber(method.settings?.cost?.value),
          zoneId: zone.id,
          instanceId: method.instance_id,
        }));
    })
  );

  return methodsByZone.flat();
}

export async function createStoreOrder(input: CreateStoreOrderInput) {
  const [paymentMethods, shippingMethods] = await Promise.all([
    getStorePaymentMethods(),
    getStoreShippingMethods(),
  ]);
  const paymentMethod = paymentMethods.find((method) => method.id === input.paymentMethodId);
  const shippingMethod = shippingMethods.find((method) => method.id === input.shippingMethodId);

  if (!paymentMethod || !shippingMethod) return null;

  const order = await postWoo<WooOrder>("orders", {
    payment_method: paymentMethod.id,
    payment_method_title: paymentMethod.title,
    set_paid: false,
    status: "pending",
    customer_note: input.customer.notes,
    billing: {
      first_name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
      address_1: input.customer.address,
      city: input.customer.city,
      postcode: input.customer.postalCode,
      country: "AR",
    },
    shipping: {
      first_name: input.customer.name,
      address_1: input.customer.address,
      city: input.customer.city,
      postcode: input.customer.postalCode,
      country: "AR",
    },
    line_items: input.items.map((item) => ({
      product_id: Number(item.productId),
      quantity: item.quantity,
      meta_data: [
        ...(item.selection?.size ? [{ key: "Talle", value: item.selection.size }] : []),
        ...(item.selection?.color ? [{ key: "Color", value: item.selection.color }] : []),
      ],
    })),
    shipping_lines: [
      {
        method_id: shippingMethod.methodId,
        method_title: shippingMethod.title,
        total: String(shippingMethod.total),
      },
    ],
  });

  if (!order) return null;

  return {
    id: order.id,
    orderKey: order.order_key,
    paymentUrl: order.payment_url ?? order.checkout_payment_url ?? buildWooOrderPayUrl(order),
  };
}