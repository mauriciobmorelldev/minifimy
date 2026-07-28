import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { Product } from "@/models/product";

type NewArrivalsCarouselProps = {
  products: Product[];
};

export function NewArrivalsCarousel({ products }: NewArrivalsCarouselProps) {
  if (products.length === 0) return null;

  return (
    <section className="relative px-5 py-16 sm:px-8 lg:px-10" aria-labelledby="new-arrivals-title">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.4rem] bg-[#efe4d1] px-4 py-8 shadow-soft ring-1 ring-primary/10 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl space-y-3">
            <span className="chip bg-white/75">Nuevos ingresos</span>
            <h2 id="new-arrivals-title" className="font-headline text-4xl font-extrabold leading-tight text-on-surface sm:text-5xl">
              Lo último que llegó a MiniFimy.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-on-surface-variant sm:text-base">
              Una pasadita suave por las prendas más nuevas, recién acomodadas para mirar sin apuro.
            </p>
          </div>
          <Link href="/catalogo?orden=newest" className="inline-flex items-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift md:self-auto">
            Ver todos
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </ScrollReveal>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:thin] [scrollbar-color:#8b5e24_transparent] sm:gap-5 lg:gap-6" aria-label="Carrusel de nuevos ingresos">
          {products.slice(0, 15).map((product) => (
            <div key={product.id} className="w-[78vw] shrink-0 snap-start sm:w-[310px] lg:w-[300px] xl:w-[320px]">
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
