import type { CartItem, Product, ProductPriceSet, ProductVariant } from "@/models/product";

export const blackFridayPreview =
  process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_MINIFIMY_BLACK_FRIDAY_PREVIEW === "true";
export const BLACK_FRIDAY_DISCOUNT = 50;
export const BLACK_FRIDAY_INSTALLMENTS = 6;
export const LOCAL_SHIPPING_GOAL = 50_000;
export const NATIONAL_SHIPPING_GOAL = 100_000;
export const BLACK_FRIDAY_CATEGORY_IMAGES = {
  bebes: "/brand/hero/home-banner-3.jpeg",
  ninos: "/brand/black-friday/buzo-a-rayas-friza.jpg",
  ninas: "/brand/hero/home-banner-1.jpeg",
};

const ars = new Intl.NumberFormat("es-AR", { currency: "ARS", style: "currency", maximumFractionDigits: 0 });

export function formatCampaignPrice(amount: number) {
  return ars.format(amount);
}

export function formatBlackFridayPrice(amount: number) {
  return `$${amount.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;
}

export function getBlackFridayPrice(price: number, prices?: ProductPriceSet) {
  // Woo expone el precio de lista por separado cuando base ya incluye una rebaja.
  const original = [prices?.list, prices?.base, price].find((value) =>
    typeof value === "number" && Number.isFinite(value) && value > 0,
  );
  if (original === undefined) return undefined;
  const final = Math.round(original * (100 - BLACK_FRIDAY_DISCOUNT)) / 100;
  return { original, final };
}

export function formatBlackFridayInstallment(cardPrice: number) {
  return formatBlackFridayPrice(cardPrice / BLACK_FRIDAY_INSTALLMENTS);
}

export function getBlackFridayOptionPricing(product: Product, variant?: ProductVariant) {
  return {
    price: variant?.price ?? product.price,
    prices: variant?.prices ?? (variant?.price === undefined ? product.prices : undefined),
  };
}

export function getBlackFridayTransferSubtotal(items: readonly CartItem[]) {
  return items.reduce((subtotal, { product, quantity }) =>
    subtotal + (getBlackFridayPrice(product.price, product.prices)?.final ?? 0) * quantity, 0);
}
