import type { CartItem, Product, ProductSelection } from "@/models/product";

export const META_CURRENCY = "ARS";

export type MetaEventName =
  | "PageView"
  | "ViewCategory"
  | "ViewContent"
  | "AddToCart"
  | "RemoveFromCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase";

export type MetaCustomData = Record<string, unknown>;

interface TrackMetaEventOptions {
  eventId?: string;
  order?: { id: number; key: string };
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function getEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getUnitPrice(product: Product, selection?: ProductSelection) {
  const selectedVariant = selection?.variationId
    ? product.variants?.find((variant) => variant.id === selection.variationId)
    : undefined;
  return selectedVariant?.price ?? product.price;
}

export function getMetaProductData(product: Product, quantity = 1, selection?: ProductSelection): MetaCustomData {
  const unitPrice = getUnitPrice(product, selection);
  const variantLabel = [selection?.size, selection?.color, selection?.model].filter(Boolean).join(" / ");

  return {
    content_ids: [product.id],
    content_name: product.name,
    content_category: product.category,
    content_type: "product",
    contents: [{ id: product.id, quantity, item_price: unitPrice }],
    currency: META_CURRENCY,
    value: unitPrice * quantity,
    quantity,
    ...(selection?.variationId ? { variant_id: selection.variationId } : {}),
    ...(selection?.size ? { size: selection.size } : {}),
    ...(selection?.color ? { color: selection.color } : {}),
    ...(selection?.model ? { model: selection.model } : {}),
    ...(variantLabel ? { variant: variantLabel } : {}),
  };
}

export function getMetaCartData(items: CartItem[], value: number): MetaCustomData {
  return {
    content_ids: items.map((item) => item.product.id),
    content_type: "product",
    contents: items.map((item) => ({
      id: item.product.id,
      quantity: item.quantity,
      item_price: getUnitPrice(item.product, item.selection),
    })),
    currency: META_CURRENCY,
    value,
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export function trackMetaEvent(
  eventName: MetaEventName,
  customData: MetaCustomData = {},
  options: TrackMetaEventOptions = {},
) {
  if (typeof window === "undefined") return undefined;

  const eventId = options.eventId ?? getEventId();
  const trackMethod = eventName === "ViewCategory" ? "trackCustom" : "track";
  window.fbq?.(trackMethod, eventName, customData, { eventID: eventId });

  void fetch("/api/meta/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    keepalive: true,
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      customData,
      ...(options.order ? { order: options.order } : {}),
    }),
  }).catch(() => undefined);

  return eventId;
}
