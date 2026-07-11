"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/context/cart-context";

interface MiniCartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MiniCartDrawer({ open, onClose }: MiniCartDrawerProps) {
  const { items, total, updateQuantity, removeFromCart } = useCart();
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  return (
    <div
      className={`fixed inset-0 z-[70] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-[#312b1e]/25 backdrop-blur-[2px] transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-label="Cerrar mini carrito"
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fffaf1] shadow-[0_24px_80px_rgba(49,43,30,0.22)] transition-transform duration-500 ease-soft-spring ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mini carrito"
      >
        <header className="border-b border-outline-variant/30 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                Fimi esta guardando
              </span>
              <h2 className="mt-1 font-headline text-2xl font-extrabold text-on-surface">
                Tu bolsita suave
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {itemCount === 0
                  ? "Todavia no elegiste prendas."
                  : `${itemCount} ${itemCount === 1 ? "producto elegido" : "productos elegidos"}.`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-soft transition-transform hover:scale-105"
              aria-label="Cerrar carrito"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-6 rounded-[2rem] bg-[#eadfcb] p-8">
              <Image
                src="/brand/illustrations/jirafa.svg"
                alt="Fimi"
                width={120}
                height={160}
                className="h-36 w-auto opacity-80"
              />
            </div>
            <h3 className="font-headline text-2xl font-extrabold text-on-surface">
              Fimi te ayuda a elegir.
            </h3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Empeza por recien nacido, regalos con amor o esos tejidos que se sienten abrazo.
            </p>
            <Link
              href="/catalogo"
              onClick={onClose}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-soft"
            >
              Ver catalogo
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[88px_1fr] gap-4 rounded-[1.6rem] bg-white/78 p-3 shadow-soft"
                >
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={88}
                    height={104}
                    className="h-28 w-[88px] rounded-[1.2rem] object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="line-clamp-2 font-headline text-base font-bold leading-tight text-on-surface">
                          {item.product.name}
                        </h3>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {item.product.category}{item.selection?.size ? ` · Talle ${item.selection.size}` : ""}{item.selection?.color ? ` · ${item.selection.color}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-on-surface-variant transition-colors hover:text-error"
                        aria-label={`Quitar ${item.product.name}`}
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 rounded-full bg-[#f7efe3] px-3 py-1.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-primary"
                          aria-label="Reducir cantidad"
                        >
                          <span className="material-symbols-outlined text-base">remove</span>
                        </button>
                        <span className="text-sm font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-primary"
                          aria-label="Aumentar cantidad"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                        </button>
                      </div>
                      <span className="font-headline text-sm font-extrabold text-secondary">
                        AR$ {(item.product.price * item.quantity).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <footer className="border-t border-outline-variant/30 bg-white/72 px-6 py-5">
              <div className="mb-4 flex items-center justify-between font-headline text-xl font-extrabold">
                <span>Total</span>
                <span className="text-primary">AR$ {total.toLocaleString("es-AR")}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/carrito"
                  onClick={onClose}
                  className="rounded-full bg-[#f2eadb] px-5 py-3 text-center text-sm font-bold text-primary"
                >
                  Ver carrito
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="rounded-full bg-primary px-5 py-3 text-center text-sm font-bold text-on-primary shadow-soft"
                >
                  Finalizar
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

