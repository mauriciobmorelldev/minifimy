"use client";

import { useEffect, useState } from "react";

export interface ProductSuggestion {
  id: string;
  name: string;
  slug: string;
}

export const PRODUCT_SUGGESTION_MIN_LENGTH = 3;

export function getProductSuggestionRequestUrl(query: string) {
  const normalized = query.trim();
  if (normalized.length < PRODUCT_SUGGESTION_MIN_LENGTH) return null;
  return `/api/productos?q=${encodeURIComponent(normalized)}&limit=6`;
}

export function useProductSuggestions(query: string, enabled = true) {
  const [result, setResult] = useState<{
    requestUrl: string;
    suggestions: ProductSuggestion[];
  }>({ requestUrl: "", suggestions: [] });
  const requestUrl = enabled ? getProductSuggestionRequestUrl(query) : null;

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
