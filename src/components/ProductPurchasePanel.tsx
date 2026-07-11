"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { Product, ProductSelection } from "@/models/product";

interface ProductPurchasePanelProps {
  product: Product;
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

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const selection: ProductSelection = {
    size: selectedSize || undefined,
    color: selectedColor || undefined,
  };

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
                onClick={() => setSelectedSize(size)}
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
                onClick={() => setSelectedColor(color)}
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

      <AddToCartButton
        product={product}
        quantity={quantity}
        selection={selection}
        className="w-full gap-3 rounded-full bg-primary py-4 font-headline text-base text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95 md:py-5 md:text-lg"
      >
        <span className="material-symbols-outlined">shopping_bag</span>
        Agregar al bolso
      </AddToCartButton>
    </div>
  );
}
