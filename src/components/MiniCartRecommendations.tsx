"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { useCart } from "@/context/cart-context";
import { formatCampaignPrice } from "@/lib/black-friday";
import { getProductOptions, productNeedsOptions } from "@/lib/product-options";
import { productIsInStock } from "@/lib/product-stock";
import type { Product } from "@/models/product";

const actionClass = "flex min-h-11 w-full min-w-0 items-center justify-center !rounded-full border border-primary/25 px-1.5 py-1 text-center text-xs font-bold leading-tight text-primary hover:bg-primary/5 [&>span]:block [&>span]:min-w-0 [&_.material-symbols-outlined]:hidden";

function needsSelection(product: Product) {
  return productNeedsOptions(product) || Object.values(getProductOptions(product)).some((options) => options.length > 1);
}

export function MiniCartRecommendations({ onClose }: { onClose: () => void }) {
  const { items, loading } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/productos?recommendations=1&limit=12", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json() as { products: Product[] };
        setProducts(data.products);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  const cartCategories = new Set(items.map(({ product }) => product.category));
  const cartSlugs = new Set(items.map(({ product }) => product.slug));
  const suggestions = products
    .filter((product) => productIsInStock(product) && !cartSlugs.has(product.slug))
    .sort((a, b) =>
      Number(cartCategories.has(b.category)) - Number(cartCategories.has(a.category)) ||
      Number(needsSelection(a)) - Number(needsSelection(b)),
    )
    .slice(0, 3);

  if (suggestions.length === 0) return null;

  return (
    <section aria-labelledby="mini-cart-related" className="min-w-0 space-y-2 rounded-[18px] border border-outline-variant/40 bg-white/70 p-3">
      <h3 id="mini-cart-related" className="font-headline text-base font-extrabold text-on-surface">
        {items.length > 0 ? "Completá tu bolsita" : "También te puede gustar"}
      </h3>
      {suggestions.map((product) => {
        const href = `/producto/${product.slug}`;
        return (
          <article key={product.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_4.75rem] items-center gap-2">
            <Link href={href} onClick={onClose} className="flex min-w-0 items-center gap-2">
              <Image src={product.images[0] ?? "/brand/illustrations/jirafa.svg"} alt="" width={44} height={44} className="h-9 w-9 shrink-0 rounded-md object-cover min-[360px]:h-11 min-[360px]:w-11" />
              <span className="min-w-0 text-sm font-bold leading-tight text-on-surface [overflow-wrap:anywhere]">
                {product.name}
                <span className="mt-0.5 block text-xs font-medium text-on-surface-variant">{formatCampaignPrice(product.prices?.list ?? product.prices?.base ?? product.price)}</span>
              </span>
            </Link>
            {needsSelection(product) ? (
              <Link href={href} onClick={onClose} className={actionClass} aria-label={`Elegir opciones de ${product.name}`}>Elegir</Link>
            ) : (
              <AddToCartButton product={product} disabled={loading} className={actionClass} aria-label={`Agregar ${product.name}`}>Agregar</AddToCartButton>
            )}
          </article>
        );
      })}
    </section>
  );
}
