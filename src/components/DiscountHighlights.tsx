import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getDisplayPrice } from "@/components/ProductPrice";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { Product } from "@/models/product";

type DiscountHighlightsProps = {
  products: Product[];
};

export function productHasDiscount(product: Product) {
  return getDisplayPrice(product.price, product.prices).hasSale;
}

export function DiscountHighlights({ products }: DiscountHighlightsProps) {
  const discountedProducts = Array.from(
    new Map(products.filter(productHasDiscount).map((product) => [product.id, product])).values(),
  ).slice(0, 4);
  if (discountedProducts.length === 0) return null;

  return (
    <section className="relative px-5 py-12 sm:px-8 sm:py-16 lg:px-10" aria-labelledby="discount-highlights-title">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.8rem] bg-[#9b4f35] px-5 py-10 shadow-lift sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[42px] border-[#f3cbb5]/20" />
        <div className="pointer-events-none absolute -bottom-24 left-[18%] h-56 w-56 rounded-full bg-[#f6dfc9]/10 blur-2xl" />

        <ScrollReveal className="relative mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-[#fff7eb] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#9b4f35] shadow-soft">
              Ofertas MiniFimy
            </span>
            <h2 id="discount-highlights-title" className="mt-4 font-headline text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl">
              Pequeños precios, grandes oportunidades.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              Prendas con descuento cargado directamente desde WooCommerce. El precio especial se aplica automáticamente.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 self-start rounded-full bg-[#fff7eb] px-6 py-3 text-sm font-bold text-[#9b4f35] shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift md:self-auto"
          >
            Ver catálogo
            <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
          </Link>
        </ScrollReveal>

        <div className="relative grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {discountedProducts.map((product, index) => (
            <ScrollReveal key={product.id} delayMs={index * 70} className="h-full">
              <ProductCard product={product} compact />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
