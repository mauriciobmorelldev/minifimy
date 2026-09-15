"use client";

import Image from "next/image";
import Link from "next/link";
import { getDisplayPrice } from "@/components/ProductPrice";
import { PRODUCT_SUGGESTION_MIN_LENGTH, type ProductSuggestion } from "@/hooks/use-product-suggestions";

interface ProductSearchSuggestionsProps {
  suggestions: ProductSuggestion[];
  query: string;
  onSelect?: () => void;
  className?: string;
}

function formatPrice(value: number) {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

function formatCategory(value: string) {
  const readable = value.replace(/-/g, " ").replace(/\brecien\b/gi, "recién");
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

export function ProductSearchSuggestions({
  suggestions,
  query,
  onSelect,
  className = "",
}: ProductSearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  const isSearching = query.trim().length >= PRODUCT_SUGGESTION_MIN_LENGTH;

  return (
    <section
      className={`overflow-hidden rounded-[1.2rem] border border-primary/10 bg-[#fffaf1] shadow-soft ${className}`}
      aria-label="Sugerencias de productos"
    >
      <p className="border-b border-primary/10 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary/70">
        {isSearching ? "Coincidencias para tu búsqueda" : "Recomendados MiniFimy"}
      </p>
      <ul className="grid max-h-[min(58vh,31rem)] gap-2 overflow-y-auto overscroll-contain p-2">
        {suggestions.map((product) => {
          const { listPrice, finalPrice, hasDiscount, installmentAmount } = getDisplayPrice(product.price, product.prices);

          return (
            <li key={product.id}>
              <Link
                href={`/producto/${product.slug}`}
                prefetch={false}
                onClick={onSelect}
                aria-label={`Ver ${product.name}`}
                className="group grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-[1rem] bg-white/80 p-2 transition-colors hover:bg-[#f7efe3]"
              >
                <span className="relative h-20 w-16 overflow-hidden rounded-[0.8rem] bg-[#efe4d0]">
                  <Image
                    src={product.image}
                    alt=""
                    fill
                    sizes="64px"
                    quality={68}
                    loading="lazy"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </span>
                <span className="min-w-0 self-center">
                  <span className="block truncate text-[9px] font-extrabold uppercase tracking-[0.14em] text-primary/65">
                    {formatCategory(product.category)}
                  </span>
                  <span className="mt-0.5 block line-clamp-2 font-headline text-sm font-extrabold leading-tight text-on-surface">
                    {product.name}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    {hasDiscount && <span className="text-[10px] font-semibold text-primary/60">Lista {formatPrice(listPrice)}</span>}
                    <strong className="font-headline text-base text-secondary">{formatPrice(finalPrice)}</strong>
                    {hasDiscount && <span className="text-[9px] font-bold text-secondary/80">transferencia</span>}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-semibold text-primary/75">
                    3 cuotas sin interés · {formatPrice(installmentAmount)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
