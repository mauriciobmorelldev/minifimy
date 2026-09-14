"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductInfoModal, WhatsAppIcon } from "@/components/ProductInfoModal";
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

const whatsappPhone = process.env.NEXT_PUBLIC_STORE_WHATSAPP_PHONE ?? "5493794004299";

function getWhatsAppUrl(message: string) {
  const phone = whatsappPhone.replace(/[^0-9]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\s*-\s*/g, "-")
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
  const modelMatches = !selection.model || !variant.model || optionEquals(selection.model, variant.model);
  return sizeMatches && colorMatches && modelMatches;
}

function findCompatibleVariant(
  variants: ProductVariant[] | undefined,
  selection: ProductSelection,
  changedField: "size" | "color" | "model",
) {
  if (!variants?.length) return undefined;

  const availableVariants = variants.filter(variantIsInStock);
  const exactAvailableVariant = availableVariants.find((variant) => variantMatchesSelection(variant, selection));
  if (exactAvailableVariant) return exactAvailableVariant;

  const changedValue = selection[changedField];
  if (changedValue) {
    const compatibleAvailableVariant = availableVariants.find((variant) => optionEquals(variant[changedField], changedValue));
    if (compatibleAvailableVariant) return compatibleAvailableVariant;
  }

  const exactVariant = variants.find((variant) => variantMatchesSelection(variant, selection));
  if (exactVariant) return exactVariant;

  return changedValue
    ? variants.find((variant) => optionEquals(variant[changedField], changedValue))
    : undefined;
}

export function ProductPurchasePanel({ product, selection: controlledSelection, onSelectionChange, selectedVariant }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [openModal, setOpenModal] = useState<"size" | "shipping" | null>(null);
  const selectedSize = controlledSelection?.size ?? product.sizes?.[0] ?? "";
  const selectedColor = controlledSelection?.color ?? product.colors?.[0] ?? "";
  const selectedModel = controlledSelection?.model ?? product.models?.[0] ?? "";
  const selection: ProductSelection = {
    size: selectedSize || undefined,
    color: selectedColor || undefined,
    model: selectedModel || undefined,
    variationId: selectedVariant?.id,
    variationAttributes: controlledSelection?.variationAttributes ?? selectedVariant?.variationAttributes,
  };

  const updateSelection = (nextSelection: ProductSelection, changedField: "size" | "color" | "model") => {
    const mergedSelection = { ...selection, ...nextSelection, variationId: undefined };
    const compatibleVariant = findCompatibleVariant(product.variants, mergedSelection, changedField);

    onSelectionChange?.({
      ...mergedSelection,
      size: compatibleVariant?.size ?? mergedSelection.size,
      color: compatibleVariant?.color ?? mergedSelection.color,
      model: compatibleVariant?.model ?? mergedSelection.model,
      variationId: compatibleVariant?.id,
      variationAttributes: compatibleVariant?.variationAttributes,
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
            Elegí tu talle
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
          <button
            type="button"
            onClick={() => setOpenModal("size")}
            className="inline-flex text-sm font-semibold text-secondary underline underline-offset-4"
          >
            Guía de talles
          </button>
        </div>
      )}

      {product.colors && product.colors.length > 0 && (
        <div className="space-y-3 rounded-[1.5rem] bg-white/72 p-4 shadow-soft">
          <span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Elegí tu color
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

      {product.models && product.models.length > 0 && (
        <div className="space-y-3 rounded-[1.5rem] bg-white/72 p-4 shadow-soft">
          <span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Elegí modelo
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {product.models.map((model) => (
              <button
                key={model}
                type="button"
                onClick={() => updateSelection({ model }, "model")}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                  selectedModel === model
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant/30 bg-white text-primary hover:border-primary"
                }`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-white/72 p-4 shadow-soft">
        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Cantidad</span>
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
        <span className="material-symbols-outlined">shopping_cart</span>
        {!selectedInStock ? "Sin stock" : missingRequiredOptions ? "Elegí una opción disponible" : "Agregar al carrito"}
      </AddToCartButton>

      <div className="rounded-[1.5rem] bg-surface-container-low p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">local_shipping</span>
          <div>
            <p className="text-sm font-bold text-on-surface">Envíos a todo el país por Correo Argentino</p>
            <button
              type="button"
              onClick={() => setOpenModal("shipping")}
              className="mt-2 text-sm font-semibold text-secondary underline underline-offset-4"
            >
              Ver envíos y cambios
            </button>
          </div>
        </div>
      </div>

      <ProductInfoModal open={openModal === "size"} title="Guía de talles" onClose={() => setOpenModal(null)}>
        <div className="overflow-hidden rounded-[1.15rem] border border-primary/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary-container text-on-primary-container">
              <tr>
                <th className="px-4 py-3 font-bold">Talle</th>
                <th className="px-4 py-3 font-bold">Edad aprox.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {[
                ["1", "0–3 meses"],
                ["2", "3–6 meses"],
                ["3", "6–9 meses"],
                ["4", "9–12 meses"],
                ["5", "12–18 meses"],
                ["6", "18–24 meses"],
              ].map(([size, age]) => (
                <tr key={size}>
                  <td className="px-4 py-2.5 font-bold text-primary">{size}</td>
                  <td className="px-4 py-2.5 text-on-surface-variant">{age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-6 text-on-surface-variant">Las equivalencias son orientativas y pueden variar según la prenda.</p>
        <h3 className="mt-5 font-headline text-lg font-extrabold text-primary">¿Tenés dudas con el talle?</h3>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          Escribinos y te ayudamos a elegir. También podemos pasarte las medidas de la prenda que te gustó.
        </p>
        <a href={getWhatsAppUrl("Hola MiniFimy 🤎 Tengo una duda con el talle de una prenda. ¿Me ayudan a elegir?")} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-soft transition hover:brightness-110">
          <WhatsAppIcon />
          Consultar talle
        </a>
      </ProductInfoModal>

      <ProductInfoModal open={openModal === "shipping"} title="Envíos y cambios" onClose={() => setOpenModal(null)}>
        <section>
          <h3 className="font-headline text-lg font-extrabold text-primary">Envíos</h3>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">Realizamos envíos a todo el país por Correo Argentino.</p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Por el momento, coordinamos el envío después de la compra. Si querés conocer el costo antes de comprar, escribinos por WhatsApp y te lo cotizamos.
          </p>
          <a href={getWhatsAppUrl("Hola MiniFimy 🤎 Quiero consultar el costo de envío antes de realizar mi compra.")} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-soft transition hover:brightness-110">
            <WhatsAppIcon />
            Consultar costo de envío
          </a>
        </section>
        <section className="mt-6 border-t border-primary/10 pt-6">
          <h3 className="font-headline text-lg font-extrabold text-primary">Cambios</h3>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">Podés solicitar un cambio siempre que la prenda se encuentre sin uso y en perfectas condiciones.</p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">Para realizar un cambio, contactanos y te indicamos los pasos a seguir.</p>
        </section>
      </ProductInfoModal>
    </div>
  );
}
