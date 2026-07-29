"use client";

import { useMemo, useState } from "react";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPrice } from "@/components/ProductPrice";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { productIsInStock, variantIsInStock } from "@/lib/product-stock";
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
  const firstVariant = product.variants?.find(variantIsInStock) ?? product.variants?.[0];

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
  }, [product.variants, selection]);

  const visualVariant = useMemo(() => {
    return selectedVariant ?? findBestVariantForSelection(product.variants, selection);
  }, [product.variants, selectedVariant, selection]);


  const selectedPrice = selectedVariant?.price ?? visualVariant?.price ?? product.price;
  const selectedPrices = selectedVariant?.prices ?? visualVariant?.prices ?? product.prices;
  const selectedInStock = selectedVariant ? variantIsInStock(selectedVariant) : visualVariant ? variantIsInStock(visualVariant) : productIsInStock(product);
  const selectedStock = selectedInStock ? selectedVariant?.stock ?? visualVariant?.stock ?? product.stock : 0;
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
              {selectedStock > 0 ? "Stock disponible" : "Sin stock"}
            </span>
          </div>
        </header>

        <ProductPurchasePanel product={product} selection={selection} onSelectionChange={setSelection} selectedVariant={selectedVariant} />

        <div className="grid gap-3 rounded-[1.5rem] bg-surface-container-low p-5 md:p-6">
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            <div>
              <h2 className="text-sm font-bold">Envíos a todo el país</h2>
              <p className="text-sm leading-6 text-on-surface-variant">
                Consultá modalidades, costos, plazos y seguimiento antes de finalizar.
              </p>
              <a href="/envios-y-cambios" className="mt-2 inline-flex text-xs font-bold text-secondary underline underline-offset-4">
                Ver envíos y cambios
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t border-outline-variant/10 pt-4">
            <span className="material-symbols-outlined text-primary">support_agent</span>
            <div>
              <h2 className="text-sm font-bold">¿Dudas con el talle?</h2>
              <p className="text-sm leading-6 text-on-surface-variant">
                Escribinos por WhatsApp y te ayudamos a elegir antes de comprar.
              </p>
              <a href="/contacto" className="mt-2 inline-flex text-xs font-bold text-secondary underline underline-offset-4">
                Hablar con MiniFimy
              </a>
            </div>
          </div>
        </div>

        <section aria-labelledby="product-details-title" className="overflow-hidden rounded-[1.5rem] bg-white/72 shadow-soft">
          <h2 id="product-details-title" className="border-b border-primary/10 px-5 py-4 font-headline text-xl font-extrabold text-on-surface">
            Detalles del producto
          </h2>
          <div className="divide-y divide-primary/10">
          <details className="group p-5" open>
            <summary className="flex cursor-pointer list-none items-center justify-between font-headline text-lg font-extrabold">
              Descripción
              <span className="material-symbols-outlined transition group-open:rotate-180">expand_more</span>
            </summary>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-on-surface-variant">{product.description}</p>
          </details>
          {product.material && (
            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-headline text-lg font-extrabold">
                Material y composición
                <span className="material-symbols-outlined transition group-open:rotate-180">expand_more</span>
              </summary>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-on-surface-variant">{product.material}</p>
            </details>
          )}
          {product.care && (
            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-headline text-lg font-extrabold">
                Cuidados de lavado
                <span className="material-symbols-outlined transition group-open:rotate-180">expand_more</span>
              </summary>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-on-surface-variant">{product.care}</p>
            </details>
          )}
          {product.fit && (
            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-headline text-lg font-extrabold">
                Calce y talle
                <span className="material-symbols-outlined transition group-open:rotate-180">expand_more</span>
              </summary>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-on-surface-variant">{product.fit}</p>
            </details>
          )}
          {product.includes && (
            <details className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-headline text-lg font-extrabold">
                Qué incluye
                <span className="material-symbols-outlined transition group-open:rotate-180">expand_more</span>
              </summary>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-on-surface-variant">{product.includes}</p>
            </details>
          )}
          <details className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-headline text-lg font-extrabold">
              Envíos y cambios
              <span className="material-symbols-outlined transition group-open:rotate-180">expand_more</span>
            </summary>
            <p className="mt-4 text-sm leading-7 text-on-surface-variant">
              Revisá las condiciones vigentes y aprobadas antes de confirmar tu pedido.
            </p>
            <a href="/envios-y-cambios" className="mt-3 inline-flex text-sm font-bold text-secondary underline underline-offset-4">
              Consultar condiciones
            </a>
          </details>
          </div>
        </section>
      </div>
    </>
  );
}
