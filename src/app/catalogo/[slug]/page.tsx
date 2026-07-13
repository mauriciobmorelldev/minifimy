import type { Metadata } from "next";
import Link from "next/link";
import { CatalogExperience } from "@/components/CatalogExperience";
import { getStoreCategories, getStoreProductCollection, getStoreProductFilters } from "@/lib/woocommerce";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const revalidate = 300;

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

export async function generateStaticParams() {
  const categories = await getStoreCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getStoreCategories();
  const category = categories.find((item) => item.slug === slug);
  return {
    title: category ? category.name : "Categoria",
    description: category?.description ?? "Productos para cada etapa del bebe.",
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const categories = await getStoreCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-24">
        <p className="text-sm text-on-surface-variant">Categoria no encontrada.</p>
        <Link href="/catalogo" className="btn-ghost mt-6 inline-flex">
          Volver al catalogo
        </Link>
      </main>
    );
  }

  const page = getPage(getParam(query, "page"));
  const [collection, filterOptions] = await Promise.all([
    getStoreProductCollection({
      page,
      perPage: 12,
      category: category.id,
      search: getParam(query, "q"),
      size: getParam(query, "talle"),
      color: getParam(query, "color"),
      ...getPriceRange(getParam(query, "precio")),
      ...getSort(getParam(query, "orden")),
    }),
    getStoreProductFilters(),
  ]);

  return (
    <CatalogExperience
      products={collection.products}
      categories={filterOptions.categories}
      filterOptions={filterOptions}
      totalProducts={collection.total}
      totalPages={collection.totalPages}
      currentPage={collection.page}
      perPage={collection.perPage}
    />
  );
}
