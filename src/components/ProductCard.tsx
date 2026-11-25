"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductPrice } from "@/components/ProductPrice";
import { useBlackFridayCampaign } from "@/context/black-friday-context";
import { BLACK_FRIDAY_DISCOUNT, getBlackFridayPrice } from "@/lib/black-friday";
import { productNeedsOptions } from "@/lib/product-options";
import { productIsInStock } from "@/lib/product-stock";
import type { Product } from "@/models/product";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  compactMobile?: boolean;
  mobileGrid?: boolean;
  eager?: boolean;
  sizes?: string;
}

function colorValue(color: string) {
  const normalized = color.toLowerCase();
  const palette: Record<string, string> = {
    arena: "#d8c7aa",
    azul: "#b8cfe3",
    beige: "#dbc7aa",
    blanco: "#fffaf1",
    camel: "#c99a68",
    celeste: "#c8d9e6",
    choco: "#80614d",
    crema: "#f6ead6",
    gris: "#c8c2b7",
    rosa: "#eec7bf",
    salvia: "#aebc9a",
    verde: "#aebc9a",
  };

  return Object.entries(palette).find(([name]) => normalized.includes(name))?.[1] ?? "#d8c7aa";
}

export function ProductCard({ product, compactMobile = false, mobileGrid = false, eager = false, sizes = "(min-width: 1280px) 280px, (min-width: 640px) 44vw, 86vw" }: ProductCardProps) {
  const image = product.images[0] ?? "/brand/illustrations/jirafa.svg";
  const needsOptions = productNeedsOptions(product);
  const inStock = productIsInStock(product);
  const campaignActive = useBlackFridayCampaign();
  const showCampaignBadge = campaignActive && inStock && getBlackFridayPrice(product.price, product.prices) !== undefined;
  const compactBody = compactMobile || mobileGrid;
  const tighterCampaignCard = campaignActive && !compactBody;
  const mobileButton = mobileGrid ? "max-md:min-h-11 max-md:px-1.5 max-md:py-2 max-md:text-xs max-md:[&_.material-symbols-outlined]:hidden" : "";
  const mobileTitleHeight = mobileGrid ? "max-md:min-h-10" : compactBody || tighterCampaignCard ? "max-md:min-h-0" : "";

  return (
    <article className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#fffaf1] shadow-soft ring-1 ring-[#eadfcb]/80 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift ${mobileGrid ? "max-md:rounded-[1.25rem]" : ""}`}>
      <div className={`relative p-3 pb-0 ${compactBody ? "max-md:p-2 max-md:pb-0" : ""}`}>
        <div className={`relative aspect-[4/4.7] overflow-hidden rounded-[1.55rem] bg-[#efe4d0] ${compactMobile ? "max-md:aspect-[5/3] max-md:rounded-[1.2rem]" : ""} ${tighterCampaignCard || mobileGrid ? "max-md:aspect-square" : ""} ${mobileGrid ? "max-md:rounded-[0.9rem]" : ""}`}>
          <Link href={`/producto/${product.slug}`} className="absolute inset-0" aria-label={`Ver ${product.name}`}>
            <Image
              src={image}
              alt={product.name}
              fill
              sizes={sizes}
              loading={eager ? "eager" : "lazy"}
              className="object-cover transition-transform duration-700 ease-soft-spring group-hover:scale-[1.045]"
              quality={70}
            />
          </Link>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#2f2a22]/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          {!inStock && (
            <div className="absolute left-3 top-3 max-w-[72%] truncate rounded-full bg-[#f7efe3] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-secondary shadow-soft ring-1 ring-secondary/20">
              Sin stock
            </div>
          )}
          {showCampaignBadge && (
            <div className={`pointer-events-none absolute left-3 top-3 max-w-[calc(100%_-_4.5rem)] rounded-lg bg-[#790627] px-2.5 py-1.5 leading-none text-white shadow-soft ${mobileGrid ? "max-md:left-1.5 max-md:top-1.5 max-md:max-w-none max-md:px-1.5 max-md:py-1" : ""}`}>
              <span className={`block font-headline text-base font-extrabold ${mobileGrid ? "max-md:text-xs max-md:leading-none" : ""}`}>{BLACK_FRIDAY_DISCOUNT}% OFF</span>
            </div>
          )}

          <button
            type="button"
            className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#fffaf1] text-primary shadow-soft ring-1 ring-white/70 transition-all hover:scale-105 hover:text-secondary ${mobileGrid ? "max-md:right-1.5 max-md:top-1.5" : ""}`}
            aria-label="Guardar en favoritos"
          >
            <span className="material-symbols-outlined text-[21px]">favorite</span>
          </button>
        </div>
      </div>

      <div className={`flex flex-1 flex-col px-5 pb-5 pt-4 ${compactBody ? "max-md:p-2.5" : ""} ${tighterCampaignCard ? "max-md:px-4 max-md:pb-4 max-md:pt-3" : ""}`}>
        <div className={`mb-3 ${compactBody || tighterCampaignCard ? "max-md:mb-2" : ""}`}>
          <p className="mb-2 hidden text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/70 sm:block">
            {product.category}
          </p>
          <h3 className={`line-clamp-2 min-h-[3rem] font-headline text-[1.28rem] font-extrabold leading-[1.16] text-on-surface md:text-[1.36rem] ${compactBody ? "max-md:text-base max-md:leading-tight" : ""} ${mobileTitleHeight} ${tighterCampaignCard ? "max-md:text-lg" : ""}`}>
            <Link href={`/producto/${product.slug}`} className="transition-colors hover:text-primary">
              {product.name}
            </Link>
          </h3>
        </div>

        <div className={`mb-4 rounded-[1.25rem] bg-[#f8efdf] px-4 py-3 text-center ring-1 ring-[#eadfcb]/75 ${compactBody ? "max-md:mb-2 max-md:px-2 max-md:py-1.5" : ""} ${tighterCampaignCard ? "max-md:mb-3 max-md:py-2" : ""}`}>
          <ProductPrice price={product.price} prices={product.prices} compact className={mobileGrid ? "text-center max-md:[&_[data-product-price]]:text-xl" : "text-center"} />
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className={`mb-5 flex items-center justify-between gap-3 rounded-[1rem] bg-[#f7efe3]/70 px-3 py-2 ${compactBody ? "max-md:hidden" : ""} ${tighterCampaignCard ? "max-md:mb-3" : ""}`}>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary/70">Colores</span>
            <div className="flex items-center -space-x-1.5">
              {product.colors.slice(0, 5).map((color) => (
                <span
                  key={color}
                  title={color}
                  className="h-5 w-5 rounded-full border-2 border-[#fffaf1] shadow-soft ring-1 ring-on-surface/10"
                  style={{ backgroundColor: colorValue(color) }}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="ml-2 text-[11px] font-bold text-primary/70">+{product.colors.length - 5}</span>
              )}
            </div>
          </div>
        )}

        {!inStock ? (
          <button
            type="button"
            disabled
            className={`relative mt-auto inline-flex w-full cursor-not-allowed items-center justify-center gap-2 overflow-hidden rounded-full bg-[#e8ddca] px-4 py-3.5 font-headline text-sm font-bold text-primary/65 shadow-soft ${mobileButton}`}
          >
            <span className="material-symbols-outlined text-lg">inventory_2</span>
            Sin stock
          </button>
        ) : needsOptions ? (
          <Link
            href={`/producto/${product.slug}`}
            data-campaign-cta=""
            className={`group/btn relative mt-auto inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-primary px-4 py-3.5 font-headline text-sm font-bold text-on-primary shadow-soft transition-transform hover:scale-[1.015] active:scale-[0.98] ${mobileButton}`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Ver opciones
              <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
            </span>
            <span className="absolute inset-0 bg-secondary opacity-0 transition-opacity group-hover/btn:opacity-100" />
          </Link>
        ) : (
          <AddToCartButton
            product={product}
            data-campaign-cta=""
            className={`group/btn relative mt-auto w-full overflow-hidden rounded-full bg-primary px-4 py-3.5 font-headline text-sm font-bold text-on-primary shadow-soft transition-transform hover:scale-[1.015] active:scale-[0.98] ${mobileButton}`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Agregar al carrito
              <span className="material-symbols-outlined text-lg transition-transform group-hover/btn:translate-x-1">shopping_basket</span>
            </span>
            <span className="absolute inset-0 bg-secondary opacity-0 transition-opacity group-hover/btn:opacity-100" />
          </AddToCartButton>
        )}
      </div>
    </article>
  );
}
