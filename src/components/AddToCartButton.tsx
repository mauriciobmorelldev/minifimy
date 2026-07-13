"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useCart } from "@/context/cart-context";
import type { Product, ProductSelection } from "@/models/product";

interface AddToCartButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type"> {
  product: Product;
  quantity?: number;
  selection?: ProductSelection;
  className?: string;
  children?: ReactNode;
}

export function AddToCartButton({ product, quantity = 1, selection, className, children, ...buttonProps }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
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
      {...buttonProps}
      disabled={buttonProps.disabled || status === "adding"}
      onClick={async () => {
        setStatus("adding");
        try {
          await addToCart(product, quantity, selection);
          setStatus("added");
          setBump(true);
          window.setTimeout(() => setBump(false), 350);
        } catch (error) {
          console.error("No se pudo agregar al carrito", error);
          setStatus("error");
        }
        if (resetTimer.current) {
          window.clearTimeout(resetTimer.current);
        }
        resetTimer.current = window.setTimeout(() => setStatus("idle"), 1800);
      }}
    >
      {status === "adding" ? (
        <span className="flex items-center gap-2" aria-live="polite">
          <span className="material-symbols-outlined text-lg">progress_activity</span>
          Agregando
        </span>
      ) : status === "added" ? (
        <span className="flex items-center gap-2" aria-live="polite">
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          Agregado
        </span>
      ) : status === "error" ? (
        <span className="flex items-center gap-2" aria-live="polite">
          <span className="material-symbols-outlined text-lg">error</span>
          No se pudo agregar
        </span>
      ) : (
        children ?? "Agregar al carrito"
      )}
    </button>
  );
}
