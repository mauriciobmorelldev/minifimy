"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";

export default function CartClient() {
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = items.length > 0 ? 950 : 0;
  const tax = 0;
  const grandTotal = total + shipping + tax;

  return (
    <main className="mx-auto max-w-7xl px-6 pb-20 pt-28">
      <header className="mb-12 flex flex-col gap-2">
        <h1 className="font-headline text-4xl font-extrabold text-on-surface">Tu carrito</h1>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-on-surface-variant">
            {items.length === 0
              ? "Todavía no agregaste productos."
              : `${itemCount} productos seleccionados para tu bebé.`}
          </p>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            >
              Vaciar carrito
            </button>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg bg-surface-container-low p-12 text-center">
          <p className="text-on-surface-variant">Sumá prendas suaves y orgánicas.</p>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex rounded-md bg-primary px-8 py-3 font-bold text-on-primary shadow-lg shadow-primary/20 transition-transform hover:scale-105"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="relative flex flex-col gap-6 rounded-lg bg-surface-container-low p-6 md:flex-row"
              >
                <div className="h-32 w-full flex-shrink-0 md:w-32">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={128}
                    height={128}
                    className="h-full w-full rounded-md object-cover shadow-sm"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-headline text-lg font-semibold text-on-surface">
                        {item.product.name}
                      </h3>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        Talle: {item.product.sizes?.[0] ?? "Único"} | Color:{" "}
                        {item.product.colors?.[0] ?? "Natural"}
                      </p>
                    </div>
                    <p className="font-headline font-bold text-primary">
                      AR$ {(item.product.price * item.quantity).toLocaleString("es-AR")}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 rounded-md bg-surface-container-highest px-3 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        className="text-primary transition-colors hover:text-secondary"
                        aria-label="Reducir cantidad"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="px-1 text-sm font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="text-primary transition-colors hover:text-secondary"
                        aria-label="Aumentar cantidad"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="flex items-center gap-1 text-xs text-on-surface-variant transition-colors hover:text-error"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-4 rounded-lg bg-tertiary-container/30 p-6">
                <div className="rounded-full bg-tertiary-container p-3 text-on-tertiary-container">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-tertiary-container">Pago seguro</h4>
                  <p className="text-xs text-on-tertiary-container/80">
                    Checkout encriptado para tu tranquilidad.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg bg-primary-container/30 p-6">
                <div className="rounded-full bg-primary-container p-3 text-on-primary-container">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    package_2
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-primary-container">
                    Cambios en 30 días
                  </h4>
                  <p className="text-xs text-on-primary-container/80">
                    Devoluciones sin estrés para cada outfit.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-lg bg-surface-container-high p-8 shadow-lg shadow-on-surface/5">
              <h2 className="mb-6 font-headline text-xl font-bold">Resumen</h2>
              <div className="mb-8 space-y-4 text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">AR$ {total.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío estimado</span>
                  <span className="font-medium">AR$ {shipping.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos</span>
                  <span className="font-medium">AR$ {tax.toLocaleString("es-AR")}</span>
                </div>
                <div className="border-t border-outline-variant/30 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-headline text-lg font-bold">Total</span>
                    <span className="font-headline text-2xl font-extrabold text-primary">
                      AR$ {grandTotal.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-4 text-lg font-headline font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Finalizar compra
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <p className="px-4 text-center text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Al continuar aceptás nuestros términos.
                </p>
              </div>

              <div className="mt-8 border-t border-outline-variant/30 pt-8">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Código promocional
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingresá tu código"
                    className="flex-grow rounded-md bg-surface-container-lowest px-4 text-sm focus:ring-2 focus:ring-primary/40"
                  />
                  <button
                    type="button"
                    className="rounded-md bg-surface-container-highest px-4 py-2 text-xs font-bold transition-colors hover:bg-outline-variant/20"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="adventure-path mt-20 h-24 opacity-5" />
    </main>
  );
}
