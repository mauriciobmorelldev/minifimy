"use client";

import { useEffect, useState } from "react";
import type { ProductPriceSet } from "@/models/product";

export interface ProductSuggestion {
  id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  price: number;
  prices?: ProductPriceSet;
}

export const PRODUCT_SUGGESTION_MIN_LENGTH = 3;

export function getProductSuggestionRequestUrl(query: string, recommendWhenShort = false) {
  const normalized = query.trim();
  if (normalized.length < PRODUCT_SUGGESTION_MIN_LENGTH) {
    return recommendWhenShort ? "/api/productos?suggestions=1&recommendations=1&limit=4" : null;
  }
  return `/api/productos?q=${encodeURIComponent(normalized)}&suggestions=1&limit=4`;
}

export function useProductSuggestions(query: string, enabled = true, recommendWhenShort = false) {
  const [result, setResult] = useState<{
    requestUrl: string;
    suggestions: ProductSuggestion[];
  }>({ requestUrl: "", suggestions: [] });
  const requestUrl = enabled ? getProductSuggestionRequestUrl(query, recommendWhenShort) : null;

  useEffect(() => {
    if (!requestUrl) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(requestUrl, { signal: controller.signal })
        .then((response) => response.ok ? response.json() : Promise.reject(new Error("search_failed")))
        .then((payload: { products?: ProductSuggestion[] }) => {
          setResult({
            requestUrl,
            suggestions: (payload.products ?? []).filter((product) => product.slug && product.name),
          });
        })
        .catch((error: Error) => {
          if (error.name !== "AbortError") setResult({ requestUrl, suggestions: [] });
        });
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [requestUrl]);

  return requestUrl && result.requestUrl === requestUrl ? result.suggestions : [];
}
