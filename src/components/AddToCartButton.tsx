"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCart } from "@/context/cart-context";
import type { Product } from "@/models/product";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  children?: ReactNode;
}

export function AddToCartButton({ product, className, children }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [status, setStatus] = useState<"idle" | "added">("idle");
  const [bump, setBump] = useState(false);
  const resetTimer = useRef<number | null>(null);
  const classes = [
    "inline-flex items-center justify-center rounded-md font-bold transition-all touch-manipulation select-none",
    bump ? "cart-bump" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  return (
    <button
      type="button"
      className={classes}
      onClick={() => {
        addToCart(product);
        setStatus("added");
        setBump(true);
        window.setTimeout(() => setBump(false), 350);
        if (resetTimer.current) {
          window.clearTimeout(resetTimer.current);
        }
        resetTimer.current = window.setTimeout(() => setStatus("idle"), 1400);
      }}
    >
      {status === "added" ? (
        <span className="flex items-center gap-2" aria-live="polite">
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          Agregado
        </span>
      ) : (
        children ?? "Agregar al carrito"
      )}
    </button>
  );
}
