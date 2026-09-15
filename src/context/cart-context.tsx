"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product, ProductSelection } from "@/models/product";
import { getMetaProductData, trackMetaEvent } from "@/lib/meta-events";

interface CartContextValue {
  items: CartItem[];
  total: number;
  loading: boolean;
  addToCart: (product: Product, quantity?: number, selection?: ProductSelection) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<CartItem[]>;
}

type StoreApiCart = {
  items?: StoreApiCartItem[];
  totals?: { total_price?: string; currency_minor_unit?: number };
};

type StoreApiCartItem = {
  key: string;
  id?: number;
  quantity?: number;
  name?: string;
  short_description?: string;
  permalink?: string;
  images?: { src?: string; thumbnail?: string; name?: string }[];
  prices?: { price?: string; regular_price?: string; currency_minor_unit?: number };
  totals?: { line_total?: string; currency_minor_unit?: number };
  variation?: { attribute?: string; value?: string }[];
  quantity_limits?: { maximum?: number | null };
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const NONCE_STORAGE_KEY = "minifimy-wc-store-nonce";
const CART_TOKEN_STORAGE_KEY = "minifimy-wc-cart-token";
const CART_PRICE_STORAGE_KEY = "minifimy-cart-prices";
const CART_METADATA_STORAGE_KEY = "minifimy-cart-metadata";

function getStoredHeader(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function setStoredHeader(key: string, value: string | null) {
  if (typeof window === "undefined" || !value) return;
  window.localStorage.setItem(key, value);
}

export function getWooStoreRequestHeaders() {
  const headers = new Headers();
  const nonce = getStoredHeader(NONCE_STORAGE_KEY);
  const cartToken = getStoredHeader(CART_TOKEN_STORAGE_KEY);
  if (nonce) headers.set("x-wc-store-api-nonce", nonce);
  if (cartToken) headers.set("x-wc-store-api-cart-token", cartToken);
  return headers;
}

function getMoneyValue(value?: string, minorUnit = 2) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return numeric / Math.pow(10, minorUnit);
}

function getStoredCartPrices() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CART_PRICE_STORAGE_KEY) ?? "{}") as Record<string, Product["prices"]>;
  } catch {
    return {};
  }
}

function rememberCartPrices(product: Product, selection?: ProductSelection) {
  if (typeof window === "undefined" || !product.prices) return;
  const current = getStoredCartPrices();
  current[product.id] = product.prices;
  if (selection?.variationId) current[selection.variationId] = product.prices;
  window.localStorage.setItem(CART_PRICE_STORAGE_KEY, JSON.stringify(current));
}

type StoredCartMetadata = {
  product: Pick<Product, "id" | "slug" | "category" | "sizes" | "colors" | "models">;
  selection?: ProductSelection;
};

function getStoredCartMetadata() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CART_METADATA_STORAGE_KEY) ?? "{}") as Record<string, StoredCartMetadata>;
  } catch {
    return {};
  }
}

function rememberCartMetadata(product: Product, selection?: ProductSelection) {
  if (typeof window === "undefined") return;
  const current = getStoredCartMetadata();
  const metadata: StoredCartMetadata = {
    product: {
      id: product.id,
      slug: product.slug,
      category: product.category,
      sizes: product.sizes,
      colors: product.colors,
      models: product.models,
    },
    selection,
  };

  current[product.id] = metadata;
  if (selection?.variationId) current[selection.variationId] = metadata;
  window.localStorage.setItem(CART_METADATA_STORAGE_KEY, JSON.stringify(current));
}

function getSlugFromPermalink(permalink?: string) {
  if (!permalink) return undefined;
  try {
    const parts = new URL(permalink, "https://minifimy.local").pathname.split("/").filter(Boolean);
    return parts.at(-1);
  } catch {
    return undefined;
  }
}

function mapStoreItem(item: StoreApiCartItem): CartItem {
  const minorUnit = item.prices?.currency_minor_unit ?? item.totals?.currency_minor_unit ?? 2;
  const image = item.images?.[0]?.src ?? item.images?.[0]?.thumbnail ?? "/brand/illustrations/jirafa.svg";
  const storedMetadata = getStoredCartMetadata()[String(item.id ?? item.key)];
  const storedSelection = storedMetadata?.selection;
  const variation = item.variation ?? [];
  const variationAttributes = variation.flatMap((entry) =>
    entry.attribute && entry.value ? [{ attribute: entry.attribute, value: entry.value }] : []
  );
  const size = variation.find((entry) => /talle|size|edad/i.test(entry.attribute ?? ""))?.value ?? storedSelection?.size;
  const color = variation.find((entry) => /color|tono/i.test(entry.attribute ?? ""))?.value ?? storedSelection?.color;
  const model = variation.find((entry) => /modelo|model/i.test(entry.attribute ?? ""))?.value ?? storedSelection?.model;
  const price = getMoneyValue(item.prices?.price ?? item.prices?.regular_price, minorUnit);
  const listPrice = getMoneyValue(item.prices?.regular_price, minorUnit);
  const storedPrices = getStoredCartPrices()[String(item.id ?? item.key)];
  const stock = item.quantity_limits?.maximum && item.quantity_limits.maximum > 0 ? item.quantity_limits.maximum : 999;
  const prices = storedPrices ?? {
    base: price,
    list: listPrice || price,
    discount: listPrice > price ? price : undefined,
  };

  return {
    id: item.key,
    quantity: item.quantity ?? 1,
    selection: {
      size,
      color,
      model,
      variationId: item.id ? String(item.id) : storedSelection?.variationId,
      variationAttributes: variationAttributes.length ? variationAttributes : storedSelection?.variationAttributes,
    },
    product: {
      id: String(item.id ?? item.key),
      name: item.name ?? "Producto",
      slug: getSlugFromPermalink(item.permalink) ?? storedMetadata?.product.slug ?? String(item.id ?? item.key),
      description: item.short_description ?? "",
      price,
      prices,
      images: [image],
      category: storedMetadata?.product.category ?? "MiniFimy",
      sizes: storedMetadata?.product.sizes,
      colors: storedMetadata?.product.colors,
      models: storedMetadata?.product.models,
      stock,
    },
  };
}

async function storeFetch(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");

  getWooStoreRequestHeaders().forEach((value, key) => headers.set(key, value));

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });

  setStoredHeader(NONCE_STORAGE_KEY, response.headers.get("nonce"));
  setStoredHeader(CART_TOKEN_STORAGE_KEY, response.headers.get("cart-token"));

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message ?? "No pudimos actualizar la bolsita.");
  }

  return data as StoreApiCart;
}

function buildAddItemPayload(product: Product, quantity: number, selection?: ProductSelection) {
  const variation = selection?.variationAttributes?.length
    ? selection.variationAttributes
    : [
        ...(selection?.size ? [{ attribute: "Talle", value: selection.size }] : []),
        ...(selection?.color ? [{ attribute: "Color", value: selection.color }] : []),
        ...(selection?.model ? [{ attribute: "Modelo", value: selection.model }] : []),
      ];

  return {
    id: Number(product.id),
    quantity,
    ...(selection?.variationId ? { variationId: Number(selection.variationId) } : {}),
    ...(variation.length > 0 ? { variation } : {}),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<StoreApiCart>({ items: [] });
  const [loading, setLoading] = useState(false);

  const applyCart = useCallback((nextCart: StoreApiCart) => {
    setCart(nextCart ?? { items: [] });
  }, []);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const nextCart = await storeFetch("/api/woo/cart");
      applyCart(nextCart);
      return (nextCart.items ?? []).map(mapStoreItem);
    } finally {
      setLoading(false);
    }
  }, [applyCart]);

  useEffect(() => {
    // La carga inicial no debe romper la tienda si Woo no está disponible
    // en el entorno local. Las acciones de compra sí siguen propagando errores.
    void refreshCart().catch(() => undefined);
  }, [refreshCart]);

  const items = useMemo(() => (cart.items ?? []).map(mapStoreItem), [cart.items]);
  const total = useMemo(() => {
    const minorUnit = cart.totals?.currency_minor_unit ?? 2;
    return getMoneyValue(cart.totals?.total_price, minorUnit);
  }, [cart.totals]);

  const addToCart = async (product: Product, quantity = 1, selection?: ProductSelection) => {
    setLoading(true);
    try {
      rememberCartPrices(product, selection);
      rememberCartMetadata(product, selection);
      applyCart(await storeFetch("/api/woo/cart/add", {
        method: "POST",
        body: JSON.stringify(buildAddItemPayload(product, quantity, selection)),
      }));
      trackMetaEvent("AddToCart", getMetaProductData(product, quantity, selection));
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const currentItem = items.find((item) => item.id === itemId);
    const nextQuantity = Math.max(1, quantity);
    setLoading(true);
    try {
      applyCart(await storeFetch("/api/woo/cart/update", {
        method: "POST",
        body: JSON.stringify({ key: itemId, quantity: nextQuantity }),
      }));
      if (currentItem && nextQuantity !== currentItem.quantity) {
        const difference = Math.abs(nextQuantity - currentItem.quantity);
        trackMetaEvent(
          nextQuantity > currentItem.quantity ? "AddToCart" : "RemoveFromCart",
          getMetaProductData(currentItem.product, difference, currentItem.selection),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    const currentItem = items.find((item) => item.id === itemId);
    setLoading(true);
    try {
      applyCart(await storeFetch("/api/woo/cart/remove", {
        method: "POST",
        body: JSON.stringify({ key: itemId }),
      }));
      if (currentItem) trackMetaEvent("RemoveFromCart", getMetaProductData(currentItem.product, currentItem.quantity, currentItem.selection));
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    const currentItems = [...items];
    setLoading(true);
    try {
      for (const item of currentItems) {
        await storeFetch("/api/woo/cart/remove", {
          method: "POST",
          body: JSON.stringify({ key: item.id }),
        });
        trackMetaEvent("RemoveFromCart", getMetaProductData(item.product, item.quantity, item.selection));
      }
      await refreshCart();
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{ items, total, loading, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
