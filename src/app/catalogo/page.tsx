import { facetValues } from "@/lib/catalog-facets";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogExperience } from "@/components/CatalogExperience";
import { MetaEvent } from "@/components/MetaEvent";
import { getStoreCategories, getStoreProductCollection, getStoreProductFilters } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explorá categorías, regalos y productos de MiniFimy.",
};

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getPage(value?: string) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function getPriceRange(value?: string) {
  if (!value || value === "all") return {};
  const [min, max] = value.split("-").map(Number);
  return {
    ...(Number.isFinite(min) && min > 0 ? { minPrice: min } : {}),
    ...(Number.isFinite(max) && max > 0 ? { maxPrice: max } : {}),
  };
}

function getSort(value?: string) {
  if (value === "price-asc") return { orderby: "price" as const, order: "asc" as const };
  if (value === "price-desc") return { orderby: "price" as const, order: "desc" as const };
  if (value === "newest") return { orderby: "date" as const, order: "desc" as const };
  return { orderby: "menu_order" as const, order: "asc" as const };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const selectedCategories = facetValues(params.categoria);
  const categories = selectedCategories.length ? await getStoreCategories() : [];
  const categoryIds = categories.filter((category) => selectedCategories.includes(category.slug)).map((category) => category.id);
  const page = getPage(getParam(params, "page"));
  const [collection, filterOptions] = await Promise.all([
    getStoreProductCollection({
      page,
      perPage: 12,
      category: selectedCategories.length ? categoryIds.join(",") || "0" : undefined,
      search: getParam(params, "q"),
      size: facetValues(params.talle),
      color: facetValues(params.color),
      ...getPriceRange(getParam(params, "precio")),
      ...getSort(getParam(params, "orden")),
    }),
    getStoreProductFilters(),
  ]);

  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fff8ef] pt-28" />}>
      <MetaEvent
        name="ViewCategory"
        eventKey="category-all"
        data={{
          content_name: "Catálogo",
          content_category: "Todos los productos",
          content_ids: collection.products.map((product) => product.id),
          content_type: "product",
          num_items: collection.total,
        }}
      />
      <CatalogExperience
        products={collection.products}
        categories={filterOptions.categories}
        filterOptions={filterOptions}
        totalProducts={collection.total}
        totalPages={collection.totalPages}
        currentPage={collection.page}
        perPage={collection.perPage}
      />
    </Suspense>
  );
}
