import type { Metadata } from "next";
import Link from "next/link";
import { CatalogExperience } from "@/components/CatalogExperience";
import { getStoreCategories, getStoreProductsByCategory } from "@/lib/woocommerce";
import type { Category, Product, ProductFilterOptions } from "@/models/product";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

function cleanValues(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "es"));
}

function buildCategoryFilterOptions(products: Product[], category: Category): ProductFilterOptions {
  const prices = products.map((product) => product.price).filter((price) => Number.isFinite(price) && price > 0);

  return {
    categories: [category],
    sizes: cleanValues(products.flatMap((product) => product.sizes ?? [])),
    colors: cleanValues(products.flatMap((product) => product.colors ?? [])),
    price: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    },
  };
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
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

  const products = await getStoreProductsByCategory(slug);
  const filterOptions = buildCategoryFilterOptions(products, category);

  return <CatalogExperience products={products} categories={[category]} filterOptions={filterOptions} />;
}
