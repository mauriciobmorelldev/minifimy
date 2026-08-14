import Image from "next/image";
import Link from "next/link";
import { getDisplayPrice } from "@/components/ProductPrice";
import type { Product } from "@/models/product";

interface OpportunityProductCardProps {
  product: Product;
}

function formatPrice(value: number) {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

function getSizeLabel(product: Product) {
  const sizes = product.sizes?.filter(Boolean) ?? [];
  if (sizes.length === 0) return null;

  const visibleSizes = sizes.slice(0, 4);
  const remaining = sizes.length - visibleSizes.length;
  return `Talles ${visibleSizes.join(" · ")}${remaining > 0 ? ` · +${remaining}` : ""}`;
}

export function OpportunityProductCard({ product }: OpportunityProductCardProps) {
  const image = product.images[0] ?? "/brand/illustrations/jirafa.svg";
  const { listPrice, finalPrice, hasDiscount, discountPercent } = getDisplayPrice(product.price, product.prices);
  const sizeLabel = getSizeLabel(product);

  return (
    <article className="opportunity-product-card group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#fffaf1] shadow-soft ring-1 ring-[#efd7cf] transition duration-500 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative p-3 pb-0">
        <Link
          href={`/producto/${product.slug}`}
          className="relative block aspect-[4/4.7] overflow-hidden rounded-[1.55rem] bg-[#efe4d0]"
          aria-label={`Ver ${product.name}`}
        >
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 280px, (min-width: 768px) 30vw, 76vw"
            className="object-cover transition-transform duration-700 ease-soft-spring group-hover:scale-[1.045]"
            quality={75}
          />
        </Link>

        <span className="absolute left-6 top-6 rounded-full bg-[#d95f55] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.13em] text-white shadow-soft">
          {hasDiscount ? `-${discountPercent}%` : "Oportunidad"}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="line-clamp-2 min-h-[3rem] font-headline text-[1.24rem] font-extrabold leading-[1.18] text-on-surface">
          <Link href={`/producto/${product.slug}`} className="transition-colors hover:text-[#c94f47]">
            {product.name}
          </Link>
        </h3>

        {sizeLabel && (
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
            {sizeLabel}
          </p>
        )}

        <div className="mt-4 rounded-[1.25rem] bg-[#fff0ec] px-4 py-3 ring-1 ring-[#edcfc7]">
          {hasDiscount && (
            <p className="font-headline text-sm font-bold text-on-surface-variant line-through decoration-[#c94f47]/65">
              {formatPrice(listPrice)}
            </p>
          )}
          <p className="mt-0.5 font-headline text-[1.65rem] font-extrabold leading-none text-[#c94f47]">
            {formatPrice(finalPrice)}
          </p>
          {hasDiscount && (
            <p className="mt-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#c94f47]/85">
              Precio promocional
            </p>
          )}
        </div>

        <Link
          href={`/producto/${product.slug}`}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#d95f55] px-4 py-3 font-headline text-sm font-bold text-white transition hover:bg-[#c94f47] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c94f47]"
        >
          Ver producto
          <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
        </Link>
      </div>
    </article>
  );
}
