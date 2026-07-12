import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { Product } from "@/models/product";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const image = product.images[0] ?? "/brand/illustrations/jirafa.svg";
  const needsOptions = Boolean(product.variants?.length || product.sizes?.length || product.colors?.length);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#fffaf1] shadow-soft ring-1 ring-[#eadfcb]/80 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative p-3 pb-0">
        <div className="relative aspect-[4/4.7] overflow-hidden rounded-[1.55rem] bg-[#efe4d0]">
          <Link href={`/producto/${product.slug}`} className="absolute inset-0" aria-label={`Ver ${product.name}`}>
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 280px, (min-width: 768px) 30vw, 86vw"
              className="object-cover transition-transform duration-700 ease-soft-spring group-hover:scale-[1.045]"
              quality={76}
            />
          </Link>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#2f2a22]/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          {product.badge && (
            <div className="absolute left-3 top-3 max-w-[68%] truncate rounded-full bg-[#fffaf1]/94 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-primary shadow-soft backdrop-blur">
              {product.badge}
            </div>
          )}

          <button
            type="button"
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#fffaf1]/96 text-primary shadow-soft backdrop-blur transition-all hover:scale-105 hover:text-secondary"
            aria-label="Guardar en favoritos"
          >
            <span className="material-symbols-outlined text-[21px]">favorite</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <div className="mb-3">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/70">
            {product.category}
          </p>
          <h3 className="line-clamp-2 min-h-[3rem] font-headline text-[1.28rem] font-extrabold leading-[1.16] text-on-surface md:text-[1.36rem]">
            <Link href={`/producto/${product.slug}`} className="transition-colors hover:text-primary">
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.15rem] bg-white/72 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Precio</span>
          <span className="font-headline text-lg font-extrabold text-secondary">
            AR$ {product.price.toLocaleString("es-AR")}
          </span>
        </div>

        {!compact && (
          <p className="mb-5 line-clamp-2 min-h-11 text-sm leading-6 text-on-surface-variant">
            {product.description}
          </p>
        )}

        {needsOptions ? (
          <Link
            href={`/producto/${product.slug}`}
            className="group/btn relative mt-auto inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-primary px-4 py-3.5 font-headline text-sm font-bold text-on-primary shadow-soft transition-transform hover:scale-[1.015] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Elegir opciones
              <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
            </span>
            <span className="absolute inset-0 bg-secondary opacity-0 transition-opacity group-hover/btn:opacity-100" />
          </Link>
        ) : (
          <AddToCartButton
            product={product}
            className="group/btn relative mt-auto w-full overflow-hidden rounded-full bg-primary px-4 py-3.5 font-headline text-sm font-bold text-on-primary shadow-soft transition-transform hover:scale-[1.015] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Agregar a la bolsita
              <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:translate-x-1">shopping_basket</span>
            </span>
            <span className="absolute inset-0 bg-secondary opacity-0 transition-opacity group-hover/btn:opacity-100" />
          </AddToCartButton>
        )}
      </div>
    </article>
  );
}
