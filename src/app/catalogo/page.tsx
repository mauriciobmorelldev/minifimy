import type { Metadata } from "next";
import Image from "next/image";
import { FiltersPanel } from "@/components/FiltersPanel";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getStoreCategories, getStoreProducts } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "Catalogo",
  description: "Explora todas las categorias y productos de MINIFIMY.",
};

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([getStoreProducts({ perPage: 48 }), getStoreCategories()]);

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
          <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            Catalogo Minifimy
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            Una seleccion suave de prendas, ajuares y regalos para las primeras veces.
          </p>
        </header>
      </ScrollReveal>

      <div className="relative z-10 flex flex-col gap-12 md:flex-row">
        <ScrollReveal>
          <FiltersPanel title="Filtros">
            <div>
              <h3 className="mb-6 flex items-center gap-2 font-headline font-bold text-on-surface">
                <span className="h-6 w-1.5 rounded-full bg-primary" />
                Categoria
              </h3>
              <ul className="space-y-3 text-sm">
                {categories.slice(0, 6).map((category, index) => (
                  <li key={category.id}>
                    <label className="group flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={index === 0}
                        className="rounded-md border-outline-variant text-primary focus:ring-primary/40"
                      />
                      <span className="transition-colors group-hover:text-primary">{category.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-6 flex items-center gap-2 font-headline font-bold text-on-surface">
                <span className="h-6 w-1.5 rounded-full bg-secondary" />
                Talle
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {["0-3m", "3-6m", "6-12m", "12-24m"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    className="rounded-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-container"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </FiltersPanel>
        </ScrollReveal>

        <section className="flex-1">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
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