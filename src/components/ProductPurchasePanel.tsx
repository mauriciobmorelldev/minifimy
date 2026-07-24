"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductPrice } from "@/components/ProductPrice";
import { productNeedsOptions } from "@/lib/product-options";
import { productIsInStock, variantIsInStock } from "@/lib/product-stock";
import type { Product, ProductSelection, ProductVariant } from "@/models/product";

interface ProductPurchasePanelProps {
  product: Product;
  selection?: ProductSelection;
  onSelectionChange?: (selection: ProductSelection) => void;
  selectedVariant?: ProductVariant;
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

function normalizeOption(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function optionEquals(first?: string, second?: string) {
  return normalizeOption(first) === normalizeOption(second);
}

function variantMatchesSelection(variant: ProductVariant, selection: ProductSelection) {
  if (selection.variationId && selection.variationId === variant.id) return true;
  const sizeMatches = !selection.size || !variant.size || optionEquals(selection.size, variant.size);
  const colorMatches = !selection.color || !variant.color || optionEquals(selection.color, variant.color);
  return sizeMatches && colorMatches;
}

function findCompatibleVariant(
  variants: ProductVariant[] | undefined,
  selection: ProductSelection,
  changedField: "size" | "color",
) {
  if (!variants?.length) return undefined;

  const exactVariant = variants.find((variant) => variantMatchesSelection(variant, selection));
  if (exactVariant) return exactVariant;

  if (changedField === "color" && selection.color) {
    return variants.find((variant) => optionEquals(variant.color, selection.color));
  }

  if (changedField === "size" && selection.size) {
    return variants.find((variant) => optionEquals(variant.size, selection.size));
  }

  return undefined;
}

export function ProductPurchasePanel({ product, selection: controlledSelection, onSelectionChange, selectedVariant }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const selectedSize = controlledSelection?.size ?? product.sizes?.[0] ?? "";
  const selectedColor = controlledSelection?.color ?? product.colors?.[0] ?? "";
  const selection: ProductSelection = {
    size: selectedSize || undefined,
    color: selectedColor || undefined,
    variationId: selectedVariant?.id,
    variationAttributes: selectedVariant?.variationAttributes,
  };

  const updateSelection = (nextSelection: ProductSelection, changedField: "size" | "color") => {
    const mergedSelection = { ...selection, ...nextSelection, variationId: undefined };
    const compatibleVariant = findCompatibleVariant(product.variants, mergedSelection, changedField);

    onSelectionChange?.({
      ...mergedSelection,
      size: compatibleVariant?.size ?? mergedSelection.size,
      color: compatibleVariant?.color ?? mergedSelection.color,
      variationId: undefined,
    });
  };

  const selectedInStock = selectedVariant ? variantIsInStock(selectedVariant) : productIsInStock(product);
  const selectedPrice = selectedVariant?.price ?? product.price;
  const selectedPrices = selectedVariant?.prices ?? product.prices;
  const hasVariantData = Boolean(product.variants?.length);
  const missingRequiredOptions = productNeedsOptions(product) && !selectedVariant;
  const disabledReason = !selectedInStock
    ? "Esta opción está sin stock por ahora."
    : missingRequiredOptions
      ? hasVariantData
        ? "Esta combinación no está disponible. Probá otro talle o color."
        : "No pudimos cargar las variantes desde Fimy. Revisá que el producto tenga variaciones activas y publicadas."
      : null;

  return (
    <div className="space-y-5">
      {product.sizes && product.sizes.length > 0 && (
        <div className="space-y-3 rounded-[1.5rem] bg-white/72 p-4 shadow-soft">
          <span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Elegi talle
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateSelection({ size }, "size")}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                  selectedSize === size
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant/30 bg-white text-primary hover:border-primary"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors && product.colors.length > 0 && (
        <div className="space-y-3 rounded-[1.5rem] bg-white/72 p-4 shadow-soft">
          <span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Elegi color
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => updateSelection({ color }, "color")}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${
                  selectedColor === color
                    ? "border-primary bg-primary text-on-primary"
                    : "border-transparent bg-[#fbf4ea] text-primary hover:border-primary"
                }`}
              >
                <span className="h-4 w-4 rounded-full ring-1 ring-on-surface/10" style={{ backgroundColor: colorValue(color) }} />
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-white/72 p-4 shadow-soft">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Cantidad</span>
          <p className="text-sm text-on-surface-variant">Sumalo al bolso con las opciones elegidas.</p>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-[#fbf4ea] px-3 py-2">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="text-primary"
            aria-label="Reducir cantidad"
          >
            <span className="material-symbols-outlined text-lg">remove</span>
          </button>
          <span className="min-w-5 text-center text-sm font-extrabold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((current) => current + 1)}
            className="text-primary"
            aria-label="Aumentar cantidad"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </div>
      </div>

      {selectedVariant?.price && selectedVariant.price !== product.price && (
        <div className="rounded-[1.3rem] bg-[#f7efe3] px-4 py-3">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Precio para esta opción</span>
          <ProductPrice price={selectedPrice} prices={selectedPrices} compact />
        </div>
      )}

      {disabledReason && (
        <div className="rounded-[1.25rem] bg-[#f7efe3] px-4 py-3 text-sm font-semibold leading-6 text-primary shadow-soft">
          {disabledReason}
        </div>
      )}

      <AddToCartButton
        product={{ ...product, price: selectedPrice, prices: selectedPrices, stock: selectedInStock ? selectedVariant?.stock ?? product.stock : 0, stockStatus: selectedInStock ? product.stockStatus : "outofstock", images: selectedVariant?.image ? [selectedVariant.image, ...product.images.filter((image) => image !== selectedVariant.image)] : product.images }}
        quantity={quantity}
        selection={selection}
        disabled={missingRequiredOptions || !selectedInStock}
        className="w-full gap-3 rounded-full bg-primary py-4 font-headline text-base text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55 md:py-5 md:text-lg"
      >
        <span className="material-symbols-outlined">shopping_bag</span>
        {!selectedInStock ? "Sin stock" : missingRequiredOptions ? "Elegí una opción disponible" : "Agregar al bolso"}
      </AddToCartButton>
    </div>
  );
}
