import Link from "next/link";
import { OpportunityProductCard } from "@/components/OpportunityProductCard";
import type { Product } from "@/models/product";

interface HomeOpportunitiesProps {
  products: Product[];
}

export function HomeOpportunities({ products }: HomeOpportunitiesProps) {
  return (
    <section
      aria-labelledby="home-opportunities-title"
      className="relative px-5 pb-14 pt-10 sm:px-8 sm:pb-16 sm:pt-12 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex items-end justify-between gap-5">
          <div>
            <h2
              id="home-opportunities-title"
              className="font-headline text-3xl font-extrabold leading-tight text-[#c94f47] sm:text-4xl"
            >
              Últimas oportunidades
            </h2>
            <p className="mt-2 text-sm leading-7 text-on-surface-variant sm:text-base">
              Últimas prendas a precios increíbles
            </p>
          </div>
          <Link
            href="/catalogo/ultimas-oportunidades"
            className="hidden shrink-0 items-center gap-2 rounded-full bg-[#fff0ec] px-5 py-3 text-sm font-bold text-[#c94f47] shadow-soft ring-1 ring-[#edcfc7] transition hover:-translate-y-0.5 hover:bg-[#d95f55] hover:text-white hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c94f47] sm:inline-flex"
          >
            Ver todas las oportunidades
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              arrow_forward
            </span>
          </Link>
        </div>

        {products.length > 0 && (
          <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {products.slice(0, 8).map((product) => (
              <div key={product.id} className="w-[76vw] shrink-0 snap-start sm:w-[310px] lg:w-auto">
                <OpportunityProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        <Link
          href="/catalogo/ultimas-oportunidades"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#fff0ec] px-5 py-3 text-sm font-bold text-[#c94f47] shadow-soft ring-1 ring-[#edcfc7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c94f47] sm:hidden"
        >
          Ver todas las oportunidades
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      </div>
    </section>
  );
}
