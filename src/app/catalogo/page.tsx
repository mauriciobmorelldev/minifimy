import type { Metadata } from "next";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explorá todas las categorías y productos de MINIFIMY.",
};

export default function CatalogPage() {
  return (
    <main className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-12 pt-24">
      <div className="pointer-events-none absolute -right-20 top-40 rotate-12 opacity-5">
        <Image
          src="/brand/illustrations/jirafa.svg"
          alt="Ilustración jirafa"
          width={380}
          height={380}
          className="h-auto w-96"
        />
      </div>

      <ScrollReveal className="relative z-10 mb-12">
        <header>
          <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            Colección Aventura
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            Descubrí nuestra selección curada de algodón orgánico diseñado para pequeños
            exploradores. Suavidad que dura, calidad que protege.
          </p>
        </header>
      </ScrollReveal>

      <div className="relative z-10 flex flex-col gap-12 md:flex-row">
        <ScrollReveal>
          <aside className="w-full space-y-10 md:w-64">
            <div>
              <h3 className="mb-6 flex items-center gap-2 font-headline font-bold text-on-surface">
                <span className="h-6 w-1.5 rounded-full bg-primary" />
                Categoría
              </h3>
              <ul className="space-y-3 text-sm">
                {["Bodys", "Tejidos", "Pijamas", "Accesorios"].map((label, index) => (
                  <li key={label}>
                    <label className="group flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={index === 0}
                        className="rounded-md border-outline-variant text-primary focus:ring-primary/40"
                      />
                      <span className="transition-colors group-hover:text-primary">{label}</span>
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
                {["0-3m", "3-6m", "6-12m", "12-24m"].map((size, index) => (
                  <button
                    key={size}
                    type="button"
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      index === 0
                        ? "bg-surface-container-highest"
                        : "border border-outline-variant/20 bg-surface-container-low hover:bg-primary-container"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-6 flex items-center gap-2 font-headline font-bold text-on-surface">
                <span className="h-6 w-1.5 rounded-full bg-tertiary" />
                Color
              </h3>
              <div className="flex flex-wrap gap-4">
                {["#52653d", "#f7edd8", "#954b00"].map((color, index) => (
                  <div
                    key={color}
                    className="group flex cursor-pointer flex-col items-center gap-2"
                  >
                    <div
                      className={`h-8 w-8 rounded-full ${
                        index === 0
                          ? "ring-2 ring-primary ring-offset-2"
                          : "border border-outline-variant/30"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100">
                      {index === 0 ? "Salvia" : index === 1 ? "Crema" : "Terra"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="adventure-path mt-8 h-1 rounded-full opacity-20" />
          </aside>
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
