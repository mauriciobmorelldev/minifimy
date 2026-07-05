import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FiltersPanel } from "@/components/FiltersPanel";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getStoreCategories, getStoreProductsByCategory } from "@/lib/woocommerce";

interface CategoryPageProps {
  params: { slug: string };
}

export const revalidate = 300;

export async function generateStaticParams() {
  const categories = await getStoreCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categories = await getStoreCategories();
  const category = categories.find((item) => item.slug === params.slug);
  return {
    title: category ? category.name : "Categoria",
    description: category?.description ?? "Productos para cada etapa del bebe.",
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categories = await getStoreCategories();
  const category = categories.find((item) => item.slug === params.slug);
  const items = await getStoreProductsByCategory(params.slug);

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

  return (
    <main className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-12 pt-24">
      <div className="pointer-events-none absolute -right-20 top-40 rotate-12 opacity-5">
        <Image
          src="/brand/illustrations/jirafa.svg"
          alt="Ilustracion jirafa"
          width={380}
          height={380}
          className="h-auto w-96"
        />
      </div>

      <ScrollReveal className="relative z-10 mb-12">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            Categoria
          </p>
          <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            {category.name}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            {category.description}
          </p>
        </header>
      </ScrollReveal>

      <div className="relative z-10 flex flex-col gap-12 md:flex-row">
        <ScrollReveal>
          <FiltersPanel title="Filtros">
            <div>
              <h3 className="mb-6 flex items-center gap-2 font-headline font-bold text-on-surface">
                <span className="h-6 w-1.5 rounded-full bg-primary" />
                Filtros rapidos
              </h3>
              <ul className="space-y-3 text-sm">
                {["Organico", "Hipoalergenico", "Edicion limitada"].map((label) => (
                  <li key={label}>
                    <label className="group flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        className="rounded-md border-outline-variant text-primary focus:ring-primary/40"
                      />
                      <span className="transition-colors group-hover:text-primary">
                        {label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </FiltersPanel>
        </ScrollReveal>

        <section className="flex-1">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product, index) => (
              <ScrollReveal key={product.id} delayMs={index * 70}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}