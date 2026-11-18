"use client";

import { useMemo, useState } from "react";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfoModal } from "@/components/ProductInfoModal";
import { ProductPrice } from "@/components/ProductPrice";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { getDefaultProductVariant, getProductOptions, normalizeOption, productNeedsOptions, variantMatchesOptions } from "@/lib/product-options";
import { productIsInStock, variantIsInStock } from "@/lib/product-stock";
import { getSizeStage } from "@/lib/catalog-age";
import type { Product, ProductSelection } from "@/models/product";

interface ProductDetailClientProps {
  product: Product;
  categoryName: string;
}

type ProductVariant = NonNullable<Product["variants"]>[number];

function scoreVariantForSelection(variant: ProductVariant, selection: ProductSelection) {
  if (selection.size && variant.size && getSizeStage(selection.size) !== getSizeStage(variant.size)) return -1;
  let score = variant.image ? 1 : 0;
  const selectedColor = normalizeOption(selection.color);
  const variantColor = normalizeOption(variant.color);
  const selectedSize = normalizeOption(selection.size);
  const variantSize = normalizeOption(variant.size);
  const selectedModel = normalizeOption(selection.model);
  const variantModel = normalizeOption(variant.model);

  if (selectedColor && variantColor) {
    if (selectedColor !== variantColor) return -1;
    score += 10;
  }

  if (selectedSize && variantSize) {
    if (selectedSize === variantSize) score += 5;
    else if (!selectedColor) return -1;
  }

  if (selectedModel && variantModel) {
    if (selectedModel !== variantModel) return -1;
    score += 7;
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
  const firstVariant = getDefaultProductVariant(product);

  return {
    size: firstVariant?.size ?? product.sizes?.[0],
    color: firstVariant?.color ?? product.colors?.[0],
    model: firstVariant?.model ?? product.models?.[0],
    variationId: firstVariant?.id,
  };
}

export function ProductDetailClient({ product, categoryName }: ProductDetailClientProps) {
  const options = useMemo(() => getProductOptions(product), [product]);
  const optionFields = (["size", "color", "model"] as const).filter((field) => options[field].length > 0);
  const chooseCombination = productNeedsOptions(product) && optionFields.length > 1;
  const [selection, setSelection] = useState<ProductSelection>(() => chooseCombination ? {} : getInitialSelection(product));
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const selectionIncomplete = optionFields.some((field) => !selection[field]);
  const matchingVariants = selectionIncomplete
    ? []
    : product.variants?.filter((variant) => variantMatchesOptions(variant, selection)) ?? [];
  const selectedVariant = matchingVariants.find((variant) => variant.id === selection.variationId)
    ?? matchingVariants.find(variantIsInStock)
    ?? matchingVariants[0];

  const visualVariant = useMemo(() => {
    return selectedVariant ?? (selection.color || selection.model
      ? findBestVariantForSelection(product.variants, selection)
      : getDefaultProductVariant(product));
  }, [product, selectedVariant, selection]);

  const selectedPrice = selectedVariant?.price ?? product.price;
  const selectedPrices = selectedVariant?.prices ?? product.prices;
  const selectedInStock = selectedVariant ? variantIsInStock(selectedVariant) : productIsInStock(product);
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
          <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
            <ProductPrice price={selectedPrice} prices={selectedPrices} onShowPaymentMethods={() => setPaymentModalOpen(true)} />
            <span className="shrink-0 rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container">
              {selectedInStock ? "Stock disponible" : "Sin stock"}
            </span>
          </div>
        </header>

        <ProductPurchasePanel
          product={product}
          options={options}
          selection={selection}
          chooseCombination={chooseCombination}
          selectionIncomplete={selectionIncomplete}
          onSelectionChange={setSelection}
          selectedVariant={selectedVariant}
        />


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
          </div>
        </section>
      </div>

      <ProductInfoModal open={paymentModalOpen} title="Medios de pago" onClose={() => setPaymentModalOpen(false)}>
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">credit_card</span>
            <div>
              <h3 className="font-bold text-on-surface">Tarjetas de crédito</h3>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">Hasta 3 cuotas sin interés a través de Mercado Pago.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#009ee3]" aria-hidden="true">account_balance_wallet</span>
            <div>
              <h3 className="font-bold text-on-surface">Mercado Pago</h3>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">Pagá con los medios de pago disponibles en tu cuenta.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">account_balance</span>
            <div>
              <h3 className="font-bold text-on-surface">Transferencia bancaria</h3>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">30% de descuento abonando por transferencia.</p>
            </div>
          </div>
        </div>
      </ProductInfoModal>
    </>
  );
}
