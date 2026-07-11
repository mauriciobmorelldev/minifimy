import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { Product } from "@/models/product";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

function colorValue(color: string) {
  const normalized = color.toLowerCase();
  const palette: Record<string, string> = {
    natural: "#e9ddc7",
    beige: "#dbc7aa",
    crema: "#f6ead6",
    blanco: "#fffaf1",
    rosa: "#eec7bf",
    celeste: "#c8d9e6",
    salvia: "#aebc9a",
    verde: "#aebc9a",
    terracota: "#d9a17b",
    gris: "#c8c2b7",
  };

  return Object.entries(palette).find(([name]) => normalized.includes(name))?.[1] ?? "#d8c7aa";
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const image = product.images[0] ?? "/brand/illustrations/jirafa.svg";
  const sizes = product.sizes?.length ? product.sizes : ["Único"];
  const colors = product.colors ?? [];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.55rem] bg-white/82 shadow-soft ring-1 ring-white/70 transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-lift md:rounded-[2rem]">
      <div className="pointer-events-none absolute inset-x-5 top-5 h-24 rounded-full bg-[#f7efe3] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-80 md:h-28" />

      <div className="relative z-10 flex flex-1 flex-col p-2.5 md:p-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[#efe4d0] md:rounded-[1.55rem]">
          <Link href={`/producto/${product.slug}`} className="absolute inset-0" aria-label={`Ver ${product.name}`}>
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 45vw, 78vw"
              className="object-cover transition-transform duration-700 ease-soft-spring group-hover:scale-[1.055]"
            />
          </Link>

          <div className="absolute left-3 top-3 rounded-full bg-white/88 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-primary shadow-soft md:left-4 md:top-4 md:px-3 md:py-1.5 md:text-[10px]">
            {product.badge ?? "Elegido"}
          </div>
          <button
            type="button"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/86 text-primary shadow-soft backdrop-blur-sm transition-all hover:scale-105 hover:text-secondary md:right-4 md:top-4 md:h-10 md:w-10"
            aria-label="Guardar en favoritos"
          >
            <span className="material-symbols-outlined text-[18px] md:text-[20px]">favorite</span>
          </button>
        </div>

        <div className="flex flex-1 flex-col px-2 pb-3 pt-4 md:px-3 md:pb-4 md:pt-5">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-on-surface-variant md:text-[10px] md:tracking-[0.18em]">
                {product.category}
              </p>
              <h3 className="font-headline text-base font-extrabold leading-tight text-on-surface md:text-xl">
                <Link href={`/producto/${product.slug}`} className="transition-colors hover:text-primary">
                  {product.name}
                </Link>
              </h3>
            </div>
            <span className="shrink-0 rounded-full bg-[#f7efe3] px-2.5 py-1.5 text-xs font-extrabold text-secondary md:px-3 md:py-2 md:text-sm">
              AR$ {product.price.toLocaleString("es-AR")}
            </span>
          </div>

          {!compact && (
            <p className="mb-4 line-clamp-2 text-xs leading-5 text-on-surface-variant md:mb-5 md:text-sm md:leading-6">
              {product.description}
            </p>
          )}

          <div className="mb-4 space-y-2 md:mb-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Talles</span>
              {sizes.slice(0, compact ? 2 : 4).map((size) => (
                <span key={size} className="rounded-full bg-[#fbf4ea] px-2.5 py-1 text-[11px] font-bold text-primary/80 md:px-3 md:text-xs">
                  {size}
                </span>
              ))}
            </div>

            {colors.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Colores</span>
                {colors.slice(0, compact ? 3 : 5).map((color) => (
                  <span key={color} className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf4ea] px-2.5 py-1 text-[11px] font-bold text-primary/80">
                    <span className="h-3 w-3 rounded-full ring-1 ring-on-surface/10" style={{ backgroundColor: colorValue(color) }} />
                    {!compact && color}
                  </span>
                ))}
              </div>
            )}
          </div>

          <AddToCartButton
            product={product}
            className="group/btn relative mt-auto w-full overflow-hidden rounded-full bg-primary px-4 py-3 font-headline text-xs font-bold text-on-primary shadow-soft transition-transform hover:scale-[1.015] active:scale-[0.98] md:px-5 md:py-3.5 md:text-sm"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Agregar a la bolsita
              <span className="material-symbols-outlined text-base transition-transform group-hover/btn:translate-x-1 md:text-lg">shopping_basket</span>
            </span>
            <span className="absolute inset-0 bg-secondary opacity-0 transition-opacity group-hover/btn:opacity-100" />
          </AddToCartButton>
        </div>
      </div>
    </article>
  );
}
