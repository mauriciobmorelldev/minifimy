import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/models/product";

interface ProductCarouselProps {
  title: string;
  eyebrow?: string;
  description?: string;
  products: Product[];
  href?: string;
  ctaLabel?: string;
}

export function ProductCarousel({
  title,
  eyebrow = "Elegidos por Fimi",
  description,
  products,
  href = "/catalogo",
  ctaLabel = "Ver más",
}: ProductCarouselProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-white/58 px-4 py-6 shadow-soft sm:px-6 md:rounded-[2.4rem] md:p-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </span>
          <h2 className="mt-2 font-headline text-2xl font-extrabold leading-tight text-on-surface md:text-3xl">
            {title}
          </h2>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant md:text-base">
              {description}
            </p>
          )}
        </div>
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-2 rounded-full bg-[#f7efe3] px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary hover:text-on-primary sm:inline-flex"
        >
          {ctaLabel}
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </Link>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {products.slice(0, 8).map((product) => (
          <div key={product.id} className="min-w-[76%] snap-start sm:min-w-[42%] lg:min-w-0">
            <ProductCard product={product} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
