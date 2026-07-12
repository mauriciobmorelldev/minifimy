"use client";

import { useMemo, useState } from "react";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import type { Product, ProductSelection } from "@/models/product";

interface ProductDetailClientProps {
  product: Product;
  categoryName: string;
}

function variantMatchesSelection(variant: NonNullable<Product["variants"]>[number], selection: ProductSelection) {
  const matchesSize = !selection.size || !variant.size || variant.size === selection.size;
  const matchesColor = !selection.color || !variant.color || variant.color === selection.color;
  return matchesSize && matchesColor;
}

export function ProductDetailClient({ product, categoryName }: ProductDetailClientProps) {
  const [selection, setSelection] = useState<ProductSelection>({
    size: product.sizes?.[0],
    color: product.colors?.[0],
  });

  const selectedVariant = useMemo(() => {
    return product.variants?.find((variant) => variantMatchesSelection(variant, selection));
  }, [product.variants, selection]);

  const selectedPrice = selectedVariant?.price ?? product.price;
  const selectedStock = selectedVariant?.stock ?? product.stock;
  const galleryImages = useMemo(() => {
    const selectedImage = selectedVariant?.image;
    if (!selectedImage) return product.images;
    return [selectedImage, ...product.images.filter((image) => image !== selectedImage)];
  }, [product.images, selectedVariant?.image]);

  return (
    <>
      <div className="lg:col-span-7">
        <ProductGallery images={galleryImages} productName={product.name} selectedImage={selectedVariant?.image} />
      </div>

      <div className="space-y-7 lg:col-span-5">
        <header>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{categoryName}</p>
          <h1 className="font-headline text-[2.15rem] font-bold leading-tight text-on-surface md:text-4xl">
            {product.name}
          </h1>
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="font-headline text-2xl font-semibold text-secondary md:text-3xl">
              AR$ {selectedPrice.toLocaleString("es-AR")}
            </span>
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
