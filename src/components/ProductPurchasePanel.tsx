"use client";

import { useState } from "react";
import { getSizeLabel, groupSizesByLabel } from "@/lib/catalog-taxonomy";
import { getSizeStage } from "@/lib/catalog-age";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductInfoModal, WhatsAppIcon } from "@/components/ProductInfoModal";
import { ProductPrice } from "@/components/ProductPrice";
import { useBlackFridayCampaign } from "@/context/black-friday-context";
import { getBlackFridayOptionPricing } from "@/lib/black-friday";
import { getDefaultProductVariant, getProductOptions, optionsEqual, productNeedsOptions, variantMatchesOptions, type ProductOption } from "@/lib/product-options";
import { productIsInStock, variantIsInStock } from "@/lib/product-stock";
import type { Product, ProductSelection, ProductVariant } from "@/models/product";

interface ProductPurchasePanelProps {
  product: Product;
  options: ReturnType<typeof getProductOptions>;
  selection: ProductSelection;
  chooseCombination: boolean;
  selectionIncomplete: boolean;
  onSelectionChange: (selection: ProductSelection) => void;
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

const unavailableOptionClass = "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-600 line-through";

export function ProductPurchasePanel({ product, options, selection, chooseCombination, selectionIncomplete, onSelectionChange, selectedVariant }: ProductPurchasePanelProps) {
  const campaignActive = useBlackFridayCampaign();
  const [quantity, setQuantity] = useState(1);
  const [openModal, setOpenModal] = useState<"size" | "shipping" | null>(null);
  const [stage, setStage] = useState(() => getSizeStage(getDefaultProductVariant(product)?.size ?? options.size[0] ?? "") ?? "");
  const { size: selectedSize, color: selectedColor, model: selectedModel } = selection;
  const allSizes = options.size;
  const stageOptions = [
    { value: "bebes", label: "Bebés" },
    { value: "ninos", label: "Niños/Niñas" },
    { value: "", label: "Otros talles" },
  ].filter((stage) => allSizes.some((size) => (getSizeStage(size) ?? "") === stage.value));
  const hasStages = allSizes.some((size) => getSizeStage(size));
  const selectedStage = selectedSize ? getSizeStage(selectedSize) ?? "" : stage;
  const visibleSizes = hasStages ? allSizes.filter((size) => (getSizeStage(size) ?? "") === selectedStage) : allSizes;
  const hasVariantData = Boolean(product.variants?.length);
  const availableVariants = product.variants?.filter((variant) =>
    variantIsInStock(variant) &&
    (!hasStages || !variant.size || (getSizeStage(variant.size) ?? "") === selectedStage)
  );

  const optionIsAvailable = (field: ProductOption, value: string) =>
    !hasVariantData || Boolean(availableVariants?.some((variant) => variantMatchesOptions(variant, { ...selection, [field]: value })));

  const updateSelection = (field: ProductOption, value: string) => {
    onSelectionChange({
      size: selectedSize,
      color: selectedColor,
      model: selectedModel,
      [field]: chooseCombination && optionsEqual(selection[field], value) ? undefined : value,
    });
  };

  const changeStage = (nextStage: string) => {
    setStage(nextStage);
    if (chooseCombination) {
      onSelectionChange({});
      return;
    }

    const sizes = allSizes.filter((size) => (getSizeStage(size) ?? "") === nextStage);
    const availableSizes = sizes.filter((size) => product.variants?.some((variant) =>
      optionsEqual(variant.size, size) && variantIsInStock(variant)
    ));
    const sameLabel = availableSizes.find((size) => selectedSize && getSizeLabel(size) === getSizeLabel(selectedSize));
    const size = sameLabel ?? availableSizes[0] ?? sizes[0];
    if (size) updateSelection("size", size);
  };

  const selectedInStock = selectedVariant ? variantIsInStock(selectedVariant) : productIsInStock(product);
  const { price: selectedPrice, prices: selectedPrices } = campaignActive
    ? getBlackFridayOptionPricing(product, selectedVariant)
    : { price: selectedVariant?.price ?? product.price, prices: selectedVariant?.prices ?? product.prices };
  const missingRequiredOptions = productNeedsOptions(product) && !selectedVariant;
  const disabledReason = !selectedInStock
    ? "Esta opción está sin stock por ahora."
    : missingRequiredOptions
      ? hasVariantData
        ? selectionIncomplete
          ? null
          : "Esta combinación no está disponible. Probá con otras opciones."
        : "No pudimos cargar las variantes desde Fimy. Revisá que el producto tenga variaciones activas y publicadas."
      : null;

  return (
    <div className="space-y-5">
      {hasStages && (
        <div className="space-y-3 rounded-[1.5rem] bg-white/72 p-4 shadow-soft">
          <label htmlFor="product-size-stage" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Elegí la etapa
          </label>
          <select
            id="product-size-stage"
            value={selectedStage}
            onChange={(event) => changeStage(event.target.value)}
            className="w-full rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-sm font-bold text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {stageOptions.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
          </select>
        </div>
      )}
      {visibleSizes.length > 0 && (
        <div className="space-y-3 rounded-[1.5rem] bg-white/72 p-4 shadow-soft">
          <span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Elegí tu talle
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {groupSizesByLabel(visibleSizes).map(({ label, values }) => {
              const pressed = values.some((value) => optionsEqual(value, selectedSize));
              const availableSize = values.find((value) => optionIsAvailable("size", value));
              const unavailable = !availableSize;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateSelection("size", pressed && selectedSize ? selectedSize : availableSize ?? values[0])}
                  aria-pressed={pressed}
                  disabled={unavailable}
                  title={unavailable ? "Sin stock" : undefined}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                    unavailable ? unavailableOptionClass
                      : pressed ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant/30 bg-white text-primary hover:border-primary"
                  }`}
                >
                  {label}
                </button>
              );
            })}
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

      {options.color.length > 0 && (
        <div className="space-y-3 rounded-[1.5rem] bg-white/72 p-4 shadow-soft">
          <span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Elegí tu color
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {options.color.map((color) => {
              const pressed = optionsEqual(selectedColor, color);
              const unavailable = !optionIsAvailable("color", color);
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateSelection("color", color)}
                  aria-pressed={pressed}
                  disabled={unavailable}
                  title={unavailable ? "Sin stock" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${
                    unavailable ? unavailableOptionClass
                      : pressed ? "border-primary bg-primary text-on-primary"
                        : "border-transparent bg-[#fbf4ea] text-primary hover:border-primary"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full ring-1 ring-on-surface/10" style={{ backgroundColor: unavailable ? "#d1d5db" : colorValue(color) }} />
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {options.model.length > 0 && (
        <div className="space-y-3 rounded-[1.5rem] bg-white/72 p-4 shadow-soft">
          <span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Elegí modelo
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {options.model.map((model) => {
              const pressed = optionsEqual(selectedModel, model);
              const unavailable = !optionIsAvailable("model", model);
              return (
                <button
                  key={model}
                  type="button"
                  onClick={() => updateSelection("model", model)}
                  aria-pressed={pressed}
                  disabled={unavailable}
                  title={unavailable ? "Sin stock" : undefined}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                    unavailable ? unavailableOptionClass
                      : pressed ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant/30 bg-white text-primary hover:border-primary"
                  }`}
                >
                  {model}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {chooseCombination && hasVariantData && (
        <p className="text-sm text-on-surface-variant">
          Las opciones en gris están sin stock para esta combinación. Tocá una opción seleccionada para desmarcarla.
        </p>
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
        data-campaign-cta=""
        product={{ ...product, price: selectedPrice, prices: selectedPrices, stock: selectedInStock ? selectedVariant?.stock ?? product.stock : 0, stockStatus: selectedInStock ? product.stockStatus : "outofstock", images: selectedVariant?.image ? [selectedVariant.image, ...product.images.filter((image) => image !== selectedVariant.image)] : product.images }}
        quantity={quantity}
        selection={{ ...selection, variationId: selectedVariant?.id, variationAttributes: selectedVariant?.variationAttributes }}
        disabled={missingRequiredOptions || !selectedInStock}
        className="w-full gap-3 rounded-full bg-primary py-4 font-headline text-base text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55 md:py-5 md:text-lg"
      >
        <span className="material-symbols-outlined">shopping_cart</span>
        {!selectedInStock ? "Sin stock"
          : missingRequiredOptions && hasVariantData && selectionIncomplete ? "Completá las opciones"
            : missingRequiredOptions ? "Elegí una opción disponible" : "Agregar al carrito"}
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
