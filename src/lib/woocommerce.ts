import type { Category, Product, ProductFilterOptions, ProductVariant } from "@/models/product";
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
  "minifimy_prices",
  "stock_quantity",
  "stock_status",
  "images",
  "categories",
  "tags",
  "attributes",
  "featured",
  "type",
].join(",");

const WOO_CATEGORY_FIELDS = ["id", "name", "slug", "description"].join(",");
const WOO_VARIATION_FIELDS = ["id", "price", "regular_price", "minifimy_prices", "stock_quantity", "stock_status", "image", "attributes"].join(",");


export interface StorePaymentMethod {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  enabled: boolean;
}

export interface StoreManualPaymentDetails {
  alias?: string;
  cbu?: string;
  holder?: string;
  bank?: string;
  accountType?: string;
  whatsapp?: string;
  note?: string;
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

export interface StoreProductQuery {
  featured?: boolean;
  category?: string;
  perPage?: number;
  page?: number;
  search?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  order?: "asc" | "desc";
  orderby?: "date" | "price" | "title" | "menu_order";
}

export interface StoreProductCollection {
  products: Product[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}

export interface StoreCheckoutItem {
  productId: string;
  quantity: number;
  selection?: {
    size?: string;
    color?: string;
    variationId?: string;
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

export interface StoreCustomerInput {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
  phone?: string;
}

export interface StoreReview {
  id: string;
  reviewer: string;
  review: string;
  rating: number;
  dateCreated?: string;
  verified: boolean;
}

export interface CreateStoreReviewInput {
  productId: string;
  reviewer: string;
  email: string;
  review: string;
  rating: number;
}

export interface StoreOrderSummary {
  id: number;
  status: string;
  total: string;
  currency: string;
  dateCreated?: string;
}

export interface StoreOrderPaymentDetails extends StoreOrderSummary {
  orderKey?: string;
  paymentMethod: string;
  paymentMethodTitle: string;
  paymentInstructions?: string;
  paymentUrl?: string;
  manualPayment?: StoreManualPaymentDetails;
  customerEmail?: string;
  items: { id: number; name: string; quantity: number; total: string }[];
  shippingLines: { id: number; title: string; total: string }[];
}

type WooPaymentGateway = {
  id: string;
  title?: string;
  description?: string;
  enabled?: boolean;
  settings?: Record<string, { value?: string }>;
};

type WooManualPaymentDetails = {
  alias?: string;
  cbu?: string;
  holder?: string;
  bank?: string;
  account_type?: string;
  whatsapp?: string;
  note?: string;
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

type WooCustomer = {
  id: number;
  email?: string;
  first_name?: string;
  last_name?: string;
};

type WooProductReview = {
  id: number;
  product_id?: number;
  reviewer?: string;
  review?: string;
  rating?: number;
  date_created?: string;
  verified?: boolean;
};

type WooOrderSummary = {
  id: number;
  status?: string;
  total?: string;
  currency?: string;
  date_created?: string;
  billing?: { email?: string };
};

type WooLineItem = {
  id: number;
  name?: string;
  quantity?: number;
  total?: string;
};

type WooShippingLine = {
  id: number;
  method_title?: string;
  total?: string;
};

type WooOrderPaymentDetails = WooOrderSummary & {
  order_key?: string;
  payment_method?: string;
  payment_method_title?: string;
  billing?: { email?: string };
  line_items?: WooLineItem[];
  shipping_lines?: WooShippingLine[];
  payment_url?: string;
  checkout_payment_url?: string;
};

type WordPressAuthResponse = {
  token?: string;
  user_email?: string;
  user_display_name?: string;
  email?: string;
  name?: string;
};

type WordPressUserMe = {
  id?: number;
  name?: string;
  email?: string;
};

function getFrontendOrigin() {
  const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!frontendUrl) return undefined;

  try {
    return new URL(frontendUrl).origin;
  } catch {
    return undefined;
  }
}

function getSafePaymentUrl(value?: string) {
  if (!value) return undefined;

  try {
    const paymentUrl = new URL(value);
    if (!["http:", "https:"].includes(paymentUrl.protocol)) return undefined;

    const frontendOrigin = getFrontendOrigin();
    if (STORE_URL && frontendOrigin && paymentUrl.origin === new URL(STORE_URL).origin) {
      return `${frontendOrigin}${paymentUrl.pathname}${paymentUrl.search}${paymentUrl.hash}`;
    }

    return paymentUrl.toString();
  } catch {
    return undefined;
  }
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
  minifimy_prices?: WooMinifimyPrices;
  stock_quantity?: number | null;
  stock_status?: string;
  images?: WooImage[];
  categories?: WooCategory[];
  tags?: { name?: string; slug?: string }[];
  attributes?: { name?: string; options?: string[] }[];
  featured?: boolean;
  type?: string;
};

type WooMinifimyPrices = {
  list_price?: number | string;
  discount_price?: number | string;
  discount_gateway_ids?: string[];
  discount_label?: string;
  list_label?: string;
};

type WooVariation = {
  id: number;
  price?: string;
  regular_price?: string;
  minifimy_prices?: WooMinifimyPrices;
  stock_quantity?: number | null;
  stock_status?: string;
  image?: WooImage;
  attributes?: { name?: string; option?: string }[];
};

const STORE_URL = normalizeBaseUrl(process.env.WOOCOMMERCE_URL ?? process.env.WORDPRESS_URL);
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

function canUseWooCommerce() {
  return Boolean(STORE_URL && CONSUMER_KEY && CONSUMER_SECRET);
}

function buildWordPressUrl(path: string) {
  if (!STORE_URL) return null;
  return new URL(path, `${STORE_URL}/`).toString();
}

async function fetchWordPressJson<T>(path: string, revalidate = CACHE_SECONDS.checkout, tags: string[] = [CACHE_TAGS.checkout]) {
  const url = buildWordPressUrl(path);
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

export function getWordPressNewsletterUrl() {
  return process.env.WORDPRESS_NEWSLETTER_URL ?? buildWordPressUrl("wp-json/minifimy/v1/newsletter");
}

function cleanText(value?: string) {
  return value?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() ?? "";
}

function normalizeFilterName(value?: string) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

function getPriceNumber(value?: string | number | null) {
  const price = Number(value ?? 0);
  return Number.isFinite(price) && price > 0 ? price : 0;
}

function getMinifimyPrices(source: { price?: string; regular_price?: string; minifimy_prices?: WooMinifimyPrices }) {
  const base = getPriceNumber(source.price) || getPriceNumber(source.regular_price);
  const list = getPriceNumber(source.minifimy_prices?.list_price) || getPriceNumber(source.regular_price) || base;
  const discount = getPriceNumber(source.minifimy_prices?.discount_price);
  const validDiscount = discount > 0 && list > 0 && discount < list ? discount : undefined;
  const displayBase = validDiscount ?? (list > 1 ? list : base);

  return {
    base: displayBase,
    list: list > 0 ? list : undefined,
    discount: validDiscount,
    discountGatewayIds: Array.isArray(source.minifimy_prices?.discount_gateway_ids)
      ? source.minifimy_prices.discount_gateway_ids
      : undefined,
    discountLabel: source.minifimy_prices?.discount_label,
    listLabel: source.minifimy_prices?.list_label,
  };
}

function mapWooProduct(product: WooProduct): Product {
  const categorySlugs = product.categories?.map((category) => category.slug).filter(Boolean) ?? [];
  const categoryIds = product.categories?.map((category) => String(category.id)).filter(Boolean) ?? [];
  const category = categorySlugs[0] ?? "catalogo";
  const images = product.images?.map((image) => getSafeImage(image.src)).filter(Boolean) as string[] | undefined;
  const sizes = product.attributes?.find((attribute) =>
    attribute.name?.toLowerCase().includes("talle") || attribute.name?.toLowerCase().includes("size")
  )?.options;
  const colors = product.attributes?.find((attribute) =>
    attribute.name?.toLowerCase().includes("color")
  )?.options;

  const prices = getMinifimyPrices(product);
  const tagSlugs = product.tags?.map((tag) => tag.slug).filter(Boolean) as string[] | undefined;
  const tagNames = product.tags?.map((tag) => tag.name).filter(Boolean) as string[] | undefined;

  return {
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    description: cleanText(product.short_description) || cleanText(product.description),
    price: prices.base,
    prices,
    type: product.type,
    images: images && images.length > 0 ? images : ["/products/flatlay-01.jpg"],
    category,
    categoryId: categoryIds[0],
    categorySlugs,
    categoryIds,
    stock: product.stock_quantity ?? (product.stock_status === "instock" ? 1 : 0),
    badge: product.tags?.find((tag) => !tag.slug?.startsWith("home-"))?.name ?? product.tags?.[0]?.name,
    tagSlugs,
    tagNames,
    sizes,
    colors,
  };
}

function getVariationOption(variation: WooVariation, names: string[]) {
  return variation.attributes?.find((attribute) => {
    const name = normalizeFilterName(attribute.name);
    return names.some((item) => name.includes(item));
  })?.option;
}

function mapWooVariation(variation: WooVariation): ProductVariant {
  const variationAttributes = variation.attributes
    ?.map((attribute) => ({
      attribute: attribute.name ?? "",
      value: cleanText(attribute.option),
    }))
    .filter((attribute) => attribute.attribute && attribute.value);

  return {
    id: String(variation.id),
    size: cleanText(getVariationOption(variation, ["talle", "size", "edad"])),
    color: cleanText(getVariationOption(variation, ["color", "tono"])),
    variationAttributes,
    image: getSafeImage(variation.image?.src) ?? undefined,
    price: getMinifimyPrices(variation).base || undefined,
    prices: getMinifimyPrices(variation),
    stock: variation.stock_quantity ?? (variation.stock_status === "instock" ? 1 : 0),
  };
}

function mergeProductVariants(product: Product, variants: ProductVariant[]): Product {
  if (variants.length === 0) return product;

  const validPrices = variants
    .map((variant) => variant.prices)
    .filter((prices): prices is NonNullable<ProductVariant["prices"]> => Boolean(prices?.base && prices.base > 1));
  const bestPrices = validPrices.sort((first, second) => first.base - second.base)[0];
  const bestPrice = bestPrices?.base ?? variants.map((variant) => variant.price).find((price) => price && price > 1) ?? product.price;
  const variantImages = variants.map((variant) => variant.image).filter(Boolean) as string[];
  const images = Array.from(new Set([...product.images, ...variantImages]));
  const sizes = getUniqueSortedValues([...(product.sizes ?? []), ...variants.map((variant) => variant.size)]);
  const colors = getUniqueSortedValues([...(product.colors ?? []), ...variants.map((variant) => variant.color)]);

  return {
    ...product,
    images,
    sizes: sizes.length > 0 ? sizes : product.sizes,
    colors: colors.length > 0 ? colors : product.colors,
    price: bestPrice,
    prices: bestPrices ?? product.prices,
    variants,
  };
}

function shouldLoadVariationsForCatalog(product: Product, source?: WooProduct) {
  return product.price <= 1 || source?.type === "variable" || Boolean(product.sizes?.length || product.colors?.length);
}

async function enrichCatalogProducts(products: Product[], sources: WooProduct[]) {
  const sourceById = new Map(sources.map((source) => [String(source.id), source]));
  return Promise.all(
    products.map(async (product) => {
      if (!shouldLoadVariationsForCatalog(product, sourceById.get(product.id))) return product;
      const variants = await getStoreProductVariations(product.id);
      return mergeProductVariants(product, variants);
    })
  );
}

async function getStoreProductVariations(productId: string, revalidate = CACHE_SECONDS.products) {
  if (!canUseWooCommerce()) return [];

  const data = await fetchWoo<WooVariation[]>(
    `products/${productId}/variations`,
    { per_page: 100, _fields: WOO_VARIATION_FIELDS },
    revalidate,
    [CACHE_TAGS.products]
  );

  return (data ?? []).map(mapWooVariation);
}

function mapWooCategory(category: WooCategory): Category {
  return {
    id: String(category.id),
    name: category.name,
    slug: category.slug,
    description: cleanText(category.description) || `Productos Minifimy de ${category.name}.`,
  };
}

function mapWooReview(review: WooProductReview): StoreReview {
  return {
    id: String(review.id),
    reviewer: cleanText(review.reviewer) || "Familia Minifimy",
    review: cleanText(review.review),
    rating: Math.min(Math.max(Number(review.rating) || 0, 0), 5),
    dateCreated: review.date_created,
    verified: Boolean(review.verified),
  };
}

function mapWooOrderSummary(order: WooOrderSummary): StoreOrderSummary {
  return {
    id: order.id,
    status: order.status ?? "pending",
    total: order.total ?? "0",
    currency: order.currency ?? "ARS",
    dateCreated: order.date_created,
  };
}

async function fetchWooResponse(path: string, params: Record<string, string | number | boolean>, revalidate: number, tags: string[]) {
  const url = buildWooUrl(path, params);
  if (!url) return null;

  try {
    const response = await fetch(url, {
      next: { revalidate, tags },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`WooCommerce ${path} failed`, response.status, detail);
      return null;
    }

    return response;
  } catch {
    return null;
  }
}

async function fetchWoo<T>(path: string, params: Record<string, string | number | boolean>, revalidate: number, tags: string[]) {
  const response = await fetchWooResponse(path, params, revalidate, tags);
  if (!response) return null;

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function getWordPressJson<T>(path: string, token?: string) {
  const url = buildWordPressUrl(path);
  if (!url) return null;

  try {
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function postWordPressJson<T>(path: string, body: unknown) {
  const configuredUrl = path.startsWith("http") ? path : buildWordPressUrl(path);
  if (!configuredUrl) return null;

  try {
    const response = await fetch(configuredUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function getProductQueryParams(options: StoreProductQuery = {}) {
  return {
    per_page: options.perPage ?? 24,
    page: options.page ?? 1,
    status: "publish",
    stock_status: "instock",
    _fields: WOO_PRODUCT_FIELDS,
    ...(options.featured ? { featured: true } : {}),
    ...(options.category ? { category: options.category } : {}),
    ...(options.search ? { search: options.search } : {}),
    ...(options.minPrice ? { min_price: options.minPrice } : {}),
    ...(options.maxPrice ? { max_price: options.maxPrice } : {}),
    ...(options.order ? { order: options.order } : {}),
    ...(options.orderby ? { orderby: options.orderby } : {}),
  };
}

export async function getStoreProductCollection(options: StoreProductQuery = {}): Promise<StoreProductCollection> {
  const page = Math.max(1, Math.floor(options.page ?? 1));
  const perPage = Math.min(Math.max(Math.floor(options.perPage ?? 12), 1), 24);

  if (!canUseWooCommerce()) {
    const total = fallbackProducts.length;
    const start = (page - 1) * perPage;
    return {
      products: fallbackProducts.slice(start, start + perPage),
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      page,
      perPage,
    };
  }

  const needsAttributeFilter = Boolean(options.size || options.color);
  const requestPage = needsAttributeFilter ? 1 : page;
  const requestPerPage = needsAttributeFilter ? 100 : perPage;
  const response = await fetchWooResponse(
    "products",
    getProductQueryParams({ ...options, page: requestPage, perPage: requestPerPage }),
    CACHE_SECONDS.products,
    [CACHE_TAGS.products]
  );

  if (!response) {
    return { products: [], total: 0, totalPages: 1, page, perPage };
  }

  const data = (await response.json().catch(() => [])) as WooProduct[];
  let products = await enrichCatalogProducts(data.map(mapWooProduct), data);
  products = products.filter((product) => product.price > 1 || Boolean(product.prices?.list || product.prices?.discount));

  if (options.size) {
    products = products.filter((product) => product.sizes?.includes(options.size!));
  }

  if (options.color) {
    products = products.filter((product) => product.colors?.includes(options.color!));
  }

  if (needsAttributeFilter) {
    const total = products.length;
    const start = (page - 1) * perPage;
    return {
      products: products.slice(start, start + perPage),
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      page,
      perPage,
    };
  }

  const total = Number(response.headers.get("x-wp-total") ?? products.length);
  const totalPages = Number(response.headers.get("x-wp-totalpages") ?? Math.max(1, Math.ceil(total / perPage)));

  return { products, total, totalPages: Math.max(1, totalPages), page, perPage };
}

export async function getStoreProducts(options: StoreProductQuery = {}) {
  const collection = await getStoreProductCollection(options);

  if (!canUseWooCommerce() && collection.products.length === 0) {
    return fallbackProducts.slice(0, options.perPage ?? 24);
  }

  return collection.products;
}

export async function getFeaturedStoreProducts() {
  const collection = await getStoreProductCollection({ perPage: 48 });
  const featuredCollection = await getStoreProductCollection({ featured: true, perPage: 12 });
  const homeTaggedProducts = collection.products.filter((product) =>
    product.tagSlugs?.some((tag) => tag.startsWith("home-"))
  );
  const mergedProducts = [...homeTaggedProducts, ...featuredCollection.products, ...collection.products].filter(
    (product, index, products) => products.findIndex((item) => item.id === product.id) === index
  );

  if (mergedProducts.length > 0) return mergedProducts.slice(0, 48);

  return canUseWooCommerce() ? [] : fallbackProducts.slice(0, 6);
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
    0,
    [CACHE_TAGS.products]
  );

  if (!data?.[0]) return undefined;

  const product = mapWooProduct(data[0]);
  const variants = await getStoreProductVariations(product.id, 0);
  return mergeProductVariants(product, variants);
}

export async function getStoreProductsByCategory(slug: string) {
  const categories = await getStoreCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) return [];

  const matchesCategory = (product: Product) => {
    return (
      product.category === slug ||
      product.categoryId === category.id ||
      product.categorySlugs?.includes(slug) ||
      product.categoryIds?.includes(category.id)
    );
  };

  if (!canUseWooCommerce()) {
    const allProducts = await getStoreProducts({ perPage: 100 });
    return allProducts.filter(matchesCategory);
  }

  const productsByWooCategory = await getStoreProducts({ category: category.id, perPage: 100 });
  if (productsByWooCategory.length > 0) return productsByWooCategory;

  const allProducts = await getStoreProducts({ perPage: 100 });
  return allProducts.filter(matchesCategory);
}

export async function createStoreCustomer(input: StoreCustomerInput) {
  const customer = await postWoo<WooCustomer>("customers", {
    email: input.email,
    first_name: input.firstName,
    last_name: input.lastName,
    username: input.email,
    password: input.password,
    billing: {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
    },
  });

  if (!customer) return null;
  return { id: customer.id, email: customer.email, firstName: customer.first_name, lastName: customer.last_name };
}

export async function loginStoreCustomer(email: string, password: string) {
  const session = await postWordPressJson<WordPressAuthResponse>("wp-json/minifimy/v1/auth/login", {
    email,
    password,
  });
  const jwtEndpoint = process.env.WORDPRESS_AUTH_TOKEN_ENDPOINT || "wp-json/jwt-auth/v1/token";
  const jwtSession = session?.token
    ? session
    : await postWordPressJson<WordPressAuthResponse>(jwtEndpoint, {
        username: email,
        password,
      });

  if (!jwtSession?.token) return null;
  return {
    token: jwtSession.token,
    email: jwtSession.email ?? jwtSession.user_email ?? email,
    name: jwtSession.name ?? jwtSession.user_display_name,
  };
}

export async function verifyWordPressCustomerToken(token: string) {
  const minifimyUser = await getWordPressJson<WordPressUserMe>("wp-json/minifimy/v1/auth/me", token);
  if (minifimyUser?.email) return minifimyUser;

  const user = await getWordPressJson<WordPressUserMe>("wp-json/wp/v2/users/me", token);
  if (!user?.email) return null;
  return user;
}

export async function getStoreCustomerByEmail(email: string) {
  const customers = await fetchWoo<WooCustomer[]>(
    "customers",
    { email, per_page: 1 },
    0,
    [CACHE_TAGS.checkout]
  );
  return customers?.[0] ?? null;
}

export async function getStoreOrdersForCustomerEmail(email: string) {
  const customer = await getStoreCustomerByEmail(email);
  const [customerOrders, recentOrders] = await Promise.all([
    customer?.id
      ? fetchWoo<WooOrderSummary[]>("orders", { customer: customer.id, per_page: 20 }, 0, [CACHE_TAGS.checkout])
      : Promise.resolve([]),
    fetchWoo<WooOrderSummary[]>("orders", { per_page: 50, orderby: "date", order: "desc" }, 0, [CACHE_TAGS.checkout]),
  ]);

  const normalizedEmail = email.trim().toLowerCase();
  const emailOrders = (recentOrders ?? []).filter(
    (order) => order.billing?.email?.trim().toLowerCase() === normalizedEmail
  );
  const mergedOrders = [...(customerOrders ?? []), ...emailOrders].filter(
    (order, index, orders) => orders.findIndex((item) => item.id === order.id) === index
  );

  return mergedOrders.map(mapWooOrderSummary);
}

export async function getStoreProductReviews(productId: string) {
  if (!canUseWooCommerce()) return [];

  const reviews = await fetchWoo<WooProductReview[]>(
    "products/reviews",
    { product: Number(productId), per_page: 12, status: "approved" },
    CACHE_SECONDS.products,
    [CACHE_TAGS.products]
  );

  return (reviews ?? []).map(mapWooReview).filter((review) => review.review);
}

export async function createStoreProductReview(input: CreateStoreReviewInput) {
  const review = await postWoo<WooProductReview>("products/reviews", {
    product_id: Number(input.productId),
    reviewer: input.reviewer,
    reviewer_email: input.email,
    review: input.review,
    rating: input.rating,
  });

  return review ? mapWooReview(review) : null;
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
      instructions: cleanText(method.settings?.instructions?.value || method.settings?.account_details?.value),
      enabled: Boolean(method.enabled),
    }));
}

export async function getStoreManualPaymentDetails(): Promise<StoreManualPaymentDetails | undefined> {
  const details = await fetchWordPressJson<WooManualPaymentDetails>(
    "wp-json/minifimy/v1/manual-payment",
    CACHE_SECONDS.checkout,
    [CACHE_TAGS.checkout]
  );

  if (!details) return undefined;

  const normalized = {
    alias: cleanText(details.alias),
    cbu: cleanText(details.cbu),
    holder: cleanText(details.holder),
    bank: cleanText(details.bank),
    accountType: cleanText(details.account_type),
    whatsapp: cleanText(details.whatsapp),
    note: cleanText(details.note),
  };

  return Object.values(normalized).some(Boolean) ? normalized : undefined;
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

export async function getStoreOrderForPayment(orderId: string, orderKey?: string) {
  const order = await fetchWoo<WooOrderPaymentDetails>(
    `orders/${orderId}`,
    {},
    0,
    [CACHE_TAGS.checkout]
  );

  if (!order) return null;
  if (orderKey && order.order_key && order.order_key !== orderKey) return null;

  const [paymentMethods, manualPayment] = await Promise.all([
    getStorePaymentMethods(),
    getStoreManualPaymentDetails(),
  ]);
  const selectedPaymentMethod = paymentMethods.find((method) => method.id === order.payment_method);
  const isManualPayment = ["bacs", "cod", "cheque"].includes(order.payment_method ?? "");

  return {
    ...mapWooOrderSummary(order),
    orderKey: order.order_key,
    paymentMethod: order.payment_method ?? "",
    paymentMethodTitle: cleanText(order.payment_method_title) || order.payment_method || "Pago pendiente",
    paymentInstructions: selectedPaymentMethod?.instructions || selectedPaymentMethod?.description,
    paymentUrl: getSafePaymentUrl(order.payment_url ?? order.checkout_payment_url),
    manualPayment: isManualPayment ? manualPayment : undefined,
    customerEmail: order.billing?.email,
    items: (order.line_items ?? []).map((item) => ({
      id: item.id,
      name: item.name ?? "Producto",
      quantity: item.quantity ?? 1,
      total: item.total ?? "0",
    })),
    shippingLines: (order.shipping_lines ?? []).map((line) => ({
      id: line.id,
      title: cleanText(line.method_title) || "Envío",
      total: line.total ?? "0",
    })),
  } satisfies StoreOrderPaymentDetails;
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
      ...(item.selection?.variationId ? { variation_id: Number(item.selection.variationId) } : {}),
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
    paymentUrl: getSafePaymentUrl(order.payment_url ?? order.checkout_payment_url),
  };
}