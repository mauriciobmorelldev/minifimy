import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/models/product";
import { AddToCartButton } from "@/components/AddToCartButton";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-surface-container-low transition-all duration-300 hover:shadow-xl hover:shadow-on-surface/5">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <Image
          src="/brand/frames/marco-dots.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 90vw"
          className="object-cover"
        />
      </div>
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Link href={`/producto/${product.slug}`} className="absolute inset-0">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 90vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </Link>
          <div className="absolute left-4 top-4 rounded-md bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-primary">
            {product.badge ?? "Nuevo"}
          </div>
          <button
            type="button"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-md bg-white/80 text-primary opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100"
            aria-label="Guardar en favoritos"
          >
            <span className="material-symbols-outlined">favorite</span>
          </button>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h3 className="font-headline text-lg font-bold text-on-surface leading-tight">
              <Link href={`/producto/${product.slug}`} className="hover:text-primary">
                {product.name}
              </Link>
            </h3>
            <span className="font-bold text-secondary">
              AR$ {product.price.toLocaleString("es-AR")}
            </span>
          </div>
          <p className="mb-6 text-sm text-on-surface-variant">{product.description}</p>
          <AddToCartButton
            product={product}
            className="group/btn relative w-full rounded-md bg-primary py-4 font-headline text-sm font-bold text-on-primary"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Agregar al carrito
              <span className="material-symbols-outlined text-lg">shopping_basket</span>
            </span>
            <span className="absolute inset-0 bg-primary-dim opacity-0 transition-opacity group-hover/btn:opacity-100" />
          </AddToCartButton>
        </div>
      </div>
    </article>
  );
}
