import { getBlackFridayOptionPricing, getBlackFridayPrice } from "@/lib/black-friday";
import { productIsInStock, variantIsInStock } from "@/lib/product-stock";
import { getStoreCategories, getStoreProductCollection, type StoreProductQuery } from "@/lib/woocommerce";
import type { Category, Product } from "@/models/product";

const comboSlugs = new Set(["combo", "combos"]);
const featuredFlashSaleSlugs = new Set([
  "babucha-bati-frisada",
  "buzo-a-rayas-friza",
  "blusa-pauli",
  "pantalon-julian",
]);
const offerCategories = [
  { slug: "bodys", label: "Bodys", search: "body", name: /\b(?:bodys?|bodies)\b/i },
  { slug: "vestidos", label: "Vestidos", search: "vestido", name: /\bvestidos?\b/i },
  { slug: "conjuntos", label: "Conjuntos", search: "conjunto", name: /\bconjuntos?\b/i },
];

export type CategoryOffer = {
  label: string;
  href: string;
  price?: number;
  image?: string;
};

type CampaignCatalogScope = Pick<StoreProductQuery, "category" | "ageGroup" | "audience" | "search">;

async function getCampaignProducts(scope: CampaignCatalogScope = {}) {
  const first = await getStoreProductCollection({ ...scope, perPage: 100 });
  const products = new Map(first.products.map((product) => [product.id, product]));
  for (let page = 2; page <= first.totalPages; page++) {
    const next = await getStoreProductCollection({ ...scope, perPage: 100, page });
    for (const product of next.products) products.set(product.id, product);
  }
  return [...products.values()];
}

function excludeAccessories(categories: Category[]) {
  const accessories = new Set(["accesorios"]);
  const accessoryIds = new Set<string>();
  const pending = categories.slice();
  for (let index = 0; index < pending.length;) {
    const category = pending[index];
    if (
      accessories.has(category.slug) ||
      (category.parentId && accessoryIds.has(category.parentId)) ||
      category.menuParentSlugs?.some((slug) => accessories.has(slug))
    ) {
      accessories.add(category.slug);
      accessoryIds.add(category.id);
      pending.splice(index, 1);
      index = 0;
    } else {
      index++;
    }
  }

  return (product: Product) =>
    !accessories.has(product.category) &&
    !product.categorySlugs?.some((slug) => accessories.has(slug)) &&
    ![product.categoryId, ...(product.categoryIds ?? [])].some((id) => id && accessoryIds.has(id));
}

export async function getBlackFridayCatalogOffer(scope: CampaignCatalogScope, categories: Category[]) {
  const products = await getCampaignProducts(scope);
  const isNotAccessory = excludeAccessories(categories);
  let cheapest: { cardPrice: number; image?: string } | undefined;
  for (const product of products) {
    if (!isNotAccessory(product) || !productIsInStock(product)) continue;
    const available = product.variants?.length
      ? product.variants.filter(variantIsInStock)
      : [undefined];
    for (const variant of available) {
      const option = getBlackFridayOptionPricing(product, variant);
      const price = getBlackFridayPrice(option.price, option.prices);
      if (price && (!cheapest || price.original < cheapest.cardPrice)) {
        cheapest = { cardPrice: price.original, image: variant?.image ?? product.images[0] };
      }
    }
  }
  return cheapest;
}

export async function getBlackFridaySaleProducts() {
  const [categories, products] = await Promise.all([
    getStoreCategories(),
    getCampaignProducts(),
  ]);
  const isNotAccessory = excludeAccessories(categories);
  const comboCategoryIds = new Set(
    categories.filter(({ slug }) => comboSlugs.has(slug)).map(({ id }) => id),
  );

  const ranked = products
    .flatMap((product) => {
      if (!productIsInStock(product)) return [];
      const price = getBlackFridayPrice(product.price, product.prices);
      return price ? [{ product, price: price.final }] : [];
    })
    .sort((a, b) => a.price - b.price || a.product.name.localeCompare(b.product.name, "es"));

  const categoryOffers: CategoryOffer[] = offerCategories.map(({ slug, label, search, name }) => {
    const category = categories.find((entry) => entry.slug === slug);
    const cheapest = ranked.find(({ product }) => isNotAccessory(product) && (
      product.category === slug ||
      product.categorySlugs?.includes(slug) ||
      (category ? product.categoryId === category.id || product.categoryIds?.includes(category.id) : name.test(product.name))
    ));

    return {
      label,
      href: category ? `/catalogo/${slug}` : `/catalogo?q=${search}`,
      price: cheapest?.price,
      image: cheapest?.product.images[0],
    };
  });

  const flashSale = ranked.filter(({ product }) => isNotAccessory(product));
  return {
    flashSale: flashSale
      .filter(({ product }, index) => index < 4 || featuredFlashSaleSlugs.has(product.slug))
      .map(({ product }) => product),
    combosSale: ranked.filter(({ product }) =>
      comboSlugs.has(product.category) ||
      product.categorySlugs?.some((slug) => comboSlugs.has(slug)) ||
      product.tagSlugs?.some((slug) => comboSlugs.has(slug)) ||
      [product.categoryId, ...(product.categoryIds ?? [])].some((id) => id && comboCategoryIds.has(id)),
    ).map(({ product }) => product),
    categoryOffers,
  };
}
