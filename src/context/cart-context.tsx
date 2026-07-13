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

interface CartContextValue {
  items: CartItem[];
  total: number;
  loading: boolean;
  addToCart: (product: Product, quantity?: number, selection?: ProductSelection) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
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
  images?: { src?: string; thumbnail?: string; name?: string }[];
  prices?: { price?: string; regular_price?: string; currency_minor_unit?: number };
  totals?: { line_total?: string; currency_minor_unit?: number };
  variation?: { attribute?: string; value?: string }[];
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const NONCE_STORAGE_KEY = "minifimy-wc-store-nonce";
const CART_TOKEN_STORAGE_KEY = "minifimy-wc-cart-token";

function getStoredHeader(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function setStoredHeader(key: string, value: string | null) {
  if (typeof window === "undefined" || !value) return;
  window.localStorage.setItem(key, value);
}

function getMoneyValue(value?: string, minorUnit = 2) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return numeric / Math.pow(10, minorUnit);
}

function mapStoreItem(item: StoreApiCartItem): CartItem {
  const minorUnit = item.prices?.currency_minor_unit ?? item.totals?.currency_minor_unit ?? 2;
  const image = item.images?.[0]?.src ?? item.images?.[0]?.thumbnail ?? "/brand/illustrations/jirafa.svg";
  const variation = item.variation ?? [];
  const size = variation.find((entry) => /talle|size|edad/i.test(entry.attribute ?? ""))?.value;
  const color = variation.find((entry) => /color|tono/i.test(entry.attribute ?? ""))?.value;
  const price = getMoneyValue(item.prices?.price ?? item.prices?.regular_price, minorUnit);

  return {
    id: item.key,
    quantity: item.quantity ?? 1,
    selection: { size, color, variationId: item.id ? String(item.id) : undefined },
    product: {
      id: String(item.id ?? item.key),
      name: item.name ?? "Producto",
      slug: String(item.id ?? item.key),
      description: item.short_description ?? "",
      price,
      images: [image],
      category: "Minifimy",
      stock: 1,
    },
  };
}

async function storeFetch(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");

  const nonce = getStoredHeader(NONCE_STORAGE_KEY);
  const cartToken = getStoredHeader(CART_TOKEN_STORAGE_KEY);
  if (nonce) headers.set("x-wc-store-api-nonce", nonce);
  if (cartToken) headers.set("x-wc-store-api-cart-token", cartToken);

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
  const productId = Number(selection?.variationId ?? product.id);
  const variation: { attribute: string; value: string }[] = [];
  if (selection?.size) variation.push({ attribute: "Talle", value: selection.size });
  if (selection?.color) variation.push({ attribute: "Color", value: selection.color });

  return {
    id: productId,
    quantity,
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
      applyCart(await storeFetch("/api/woo/cart"));
    } finally {
      setLoading(false);
    }
  }, [applyCart]);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const items = useMemo(() => (cart.items ?? []).map(mapStoreItem), [cart.items]);
  const total = useMemo(() => {
    const minorUnit = cart.totals?.currency_minor_unit ?? 2;
    return getMoneyValue(cart.totals?.total_price, minorUnit);
  }, [cart.totals]);

  const addToCart = async (product: Product, quantity = 1, selection?: ProductSelection) => {
    setLoading(true);
    try {
      applyCart(await storeFetch("/api/woo/cart/add", {
        method: "POST",
        body: JSON.stringify(buildAddItemPayload(product, quantity, selection)),
      }));
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setLoading(true);
    try {
      applyCart(await storeFetch("/api/woo/cart/update", {
        method: "POST",
        body: JSON.stringify({ key: itemId, quantity: Math.max(1, quantity) }),
      }));
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setLoading(true);
    try {
      applyCart(await storeFetch("/api/woo/cart/remove", {
        method: "POST",
        body: JSON.stringify({ key: itemId }),
      }));
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
