"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

export default function CartClient() {
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = items.length > 0 ? 950 : 0;
  const grandTotal = total + shipping;

  return (
    <main className="mobile-soft-page relative overflow-hidden bg-[#fff8ef] px-4 pb-16 pt-28 md:px-6 md:pb-20">
      <div className="pointer-events-none absolute inset-0 opacity-[0.055]">
        <Image src="/brand/patterns/pattern-01.png" alt="" fill sizes="100vw" className="object-cover" />
      </div>

      <section className="relative mx-auto max-w-7xl">
        <header className="mb-8 rounded-[1.8rem] bg-[#efe4d0] px-4 py-6 shadow-soft md:mb-10 md:rounded-[2.4rem] md:px-10 md:py-8">
          <span className="inline-flex rounded-full bg-white/72 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary shadow-soft">
            Bolsita Minifimy
          </span>
          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="font-headline text-[2.15rem] font-extrabold leading-tight text-on-surface md:text-6xl">
                Lo que elegiste con amor.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base">
                Revisá cantidades, envío y últimos detalles antes de pasar por caja. Fimi lo mantiene simple.
              </p>
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="self-start rounded-full bg-white/70 px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary shadow-soft transition hover:bg-white"
              >
                Vaciar carrito
              </button>
            )}
          </div>
        </header>

        {items.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-[2.4rem] bg-white/78 p-10 text-center shadow-soft">
            <Image
              src="/brand/illustrations/jirafa.svg"
              alt="Fimi"
              width={120}
              height={170}
              className="mx-auto mb-6 h-40 w-auto opacity-80"
            />
            <h2 className="font-headline text-3xl font-extrabold text-on-surface">Tu bolsita está esperando algo suave.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-on-surface-variant">
              Sumá regalos, ajuares o prendas para recién nacido y volvé cuando quieras.
            </p>
            <Link
              href="/catalogo"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-on-primary shadow-soft transition hover:scale-[1.02]"
            >
              Explorar catálogo
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="rounded-[1.7rem] bg-white/64 px-5 py-4 text-sm font-semibold text-on-surface-variant shadow-soft">
                Fimi guardó {itemCount} {itemCount === 1 ? "producto" : "productos"} para vos.
              </div>

              {items.map((item) => (
                <article
                  key={item.product.id}
                  className="grid gap-4 rounded-[1.6rem] bg-white/78 p-3 shadow-soft transition hover:-translate-y-0.5 hover:bg-white md:grid-cols-[150px_1fr] md:gap-5 md:rounded-[2rem] md:p-4"
                >
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={150}
                    height={180}
                    className="h-44 w-full rounded-[1.5rem] object-cover md:w-[150px]"
                  />
                  <div className="flex min-w-0 flex-col justify-between gap-5 py-1">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{item.product.category}</p>
                        <h3 className="mt-1 font-headline text-xl font-extrabold leading-tight text-on-surface md:text-2xl">
                          {item.product.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                          Talle {item.product.sizes?.[0] ?? "Único"} · Color {item.product.colors?.[0] ?? "Natural"}
                        </p>
                      </div>
                      <p className="font-headline text-xl font-extrabold text-secondary">
                        AR$ {(item.product.price * item.quantity).toLocaleString("es-AR")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4 rounded-full bg-[#f7efe3] px-4 py-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="text-primary transition-colors hover:text-secondary"
                          aria-label="Reducir cantidad"
                        >
                          <span className="material-symbols-outlined text-lg">remove</span>
                        </button>
                        <span className="min-w-5 text-center text-sm font-extrabold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="text-primary transition-colors hover:text-secondary"
                          aria-label="Aumentar cantidad"
                        >
                          <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-on-surface-variant transition hover:bg-error/10 hover:text-error"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                        Quitar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-28 rounded-[2rem] bg-white/82 p-6 shadow-lift">
                <h2 className="font-headline text-2xl font-extrabold text-on-surface">Resumen dulce</h2>
                <div className="mt-6 space-y-4 text-sm text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-on-surface">AR$ {total.toLocaleString("es-AR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío estimado</span>
                    <span className="font-bold text-on-surface">AR$ {shipping.toLocaleString("es-AR")}</span>
                  </div>
                  <div className="rounded-[1.4rem] bg-[#f7efe3] p-4 text-xs leading-5 text-primary">
                    El costo final de envío puede ajustarse según zona y método elegido en checkout.
                  </div>
                  <div className="border-t border-outline-variant/30 pt-5">
                    <div className="flex items-baseline justify-between">
                      <span className="font-headline text-lg font-extrabold">Total</span>
                      <span className="font-headline text-3xl font-extrabold text-primary">
                        AR$ {grandTotal.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-headline text-base font-bold text-on-primary shadow-soft transition hover:scale-[1.02] active:scale-95"
                >
                  Finalizar compra
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>

                <div className="mt-6 grid grid-cols-2 gap-3 text-center text-xs font-bold text-primary">
                  <div className="rounded-[1.3rem] bg-[#f7efe3] p-3">Pago seguro</div>
                  <div className="rounded-[1.3rem] bg-[#f7efe3] p-3">Cambios simples</div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
