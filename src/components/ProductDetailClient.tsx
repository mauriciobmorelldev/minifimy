"use client";

import { useMemo, useState } from "react";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPrice } from "@/components/ProductPrice";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import type { Product, ProductSelection } from "@/models/product";

interface ProductDetailClientProps {
  product: Product;
  categoryName: string;
}

type ProductVariant = NonNullable<Product["variants"]>[number];

function normalizeOption(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function optionsMatch(selected?: string, actual?: string) {
  return !selected || !actual || normalizeOption(selected) === normalizeOption(actual);
}

function variantMatchesSelection(variant: ProductVariant, selection: ProductSelection) {
  if (selection.variationId && selection.variationId === variant.id) return true;
  return optionsMatch(selection.size, variant.size) && optionsMatch(selection.color, variant.color);
}

function scoreVariantForSelection(variant: ProductVariant, selection: ProductSelection) {
  let score = variant.image ? 1 : 0;
  const selectedColor = normalizeOption(selection.color);
  const variantColor = normalizeOption(variant.color);
  const selectedSize = normalizeOption(selection.size);
  const variantSize = normalizeOption(variant.size);

  if (selectedColor && variantColor) {
    if (selectedColor !== variantColor) return -1;
    score += 10;
  }

  if (selectedSize && variantSize) {
    if (selectedSize === variantSize) score += 5;
    else if (!selectedColor) return -1;
  }

  return score;
}

function findBestVariantForSelection(variants: ProductVariant[] | undefined, selection: ProductSelection) {
  if (!variants?.length) return undefined;

  return variants
    .map((variant) => ({ variant, score: scoreVariantForSelection(variant, selection) }))
    .filter(({ score }) => score >= 0)
    .sort((first, second) => second.score - first.score)[0]?.variant;
}

function getInitialSelection(product: Product): ProductSelection {
  const firstVariant = product.variants?.find((variant) => variant.stock === undefined || variant.stock > 0) ?? product.variants?.[0];

  return {
    size: firstVariant?.size ?? product.sizes?.[0],
    color: firstVariant?.color ?? product.colors?.[0],
    variationId: firstVariant?.id,
    variationAttributes: firstVariant?.variationAttributes,
  };
}

export function ProductDetailClient({ product, categoryName }: ProductDetailClientProps) {
  const [selection, setSelection] = useState<ProductSelection>(() => getInitialSelection(product));

  const selectedVariant = useMemo(() => {
    return product.variants?.find((variant) => variantMatchesSelection(variant, selection));
  }, [product.variants, selection.color, selection.size]);

  const visualVariant = useMemo(() => {
    return selectedVariant ?? findBestVariantForSelection(product.variants, selection);
  }, [product.variants, selectedVariant, selection.color, selection.size]);


  const selectedPrice = selectedVariant?.price ?? visualVariant?.price ?? product.price;
  const selectedPrices = selectedVariant?.prices ?? visualVariant?.prices ?? product.prices;
  const selectedStock = selectedVariant?.stock ?? visualVariant?.stock ?? product.stock;
  const galleryImages = useMemo(() => {
    const selectedImage = visualVariant?.image;
    const variantImages = product.variants?.flatMap((variant) => (variant.image ? [variant.image] : [])) ?? [];
    return Array.from(new Set([selectedImage, ...variantImages, ...product.images].filter(Boolean) as string[]));
  }, [product.images, product.variants, visualVariant?.image]);

  return (
    <>
      <div className="lg:col-span-7">
        <ProductGallery images={galleryImages} productName={product.name} selectedImage={visualVariant?.image} />
      </div>

      <div className="space-y-7 lg:col-span-5">
        <header>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{categoryName}</p>
          <h1 className="font-headline text-[2.15rem] font-bold leading-tight text-on-surface md:text-4xl">
            {product.name}
          </h1>
          <div className="mt-4 flex items-center justify-between gap-4">
            <ProductPrice price={selectedPrice} prices={selectedPrices} />
            <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container">
              Stock {selectedStock > 0 ? "disponible" : "a consultar"}
            </span>
          </div>
        </header>

        <ProductPurchasePanel product={product} selection={selection} onSelectionChange={setSelection} selectedVariant={selectedVariant} />

        <div className="space-y-4 rounded-[1.5rem] bg-surface-container-low p-5 md:p-6">
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            <div>
              <h4 className="text-sm font-bold">Envio cuidado</h4>
              <p className="text-sm text-on-surface-variant">Preparado en packaging Minifimy y despachado con seguimiento.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t border-outline-variant/10 pt-4">
            <span className="material-symbols-outlined text-primary">verified_user</span>
            <div>
              <h4 className="text-sm font-bold">Cambios simples</h4>
              <p className="text-sm text-on-surface-variant">Acompanamiento para elegir talle o cambiar con tranquilidad.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-headline text-xl font-bold">La historia detras</h3>
          <p className="leading-relaxed text-on-surface-variant">{product.description}</p>
        </div>
      </div>
    </>
  );
}
