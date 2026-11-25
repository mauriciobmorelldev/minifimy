"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { CampaignShippingProgress } from "@/components/CampaignShippingProgress";
import { SecureCheckoutLink } from "@/components/SecureCheckoutLink";
import { MiniCartRecommendations } from "@/components/MiniCartRecommendations";
import { useCart } from "@/context/cart-context";
import { getBlackFridayTransferSubtotal } from "@/lib/black-friday";
import { getSizeLabel, getSizeStageLabel } from "@/lib/catalog-taxonomy";
import { getCartItemOptions, getListSubtotal, getListUnitPrice } from "@/lib/checkout-options";

interface MiniCartDrawerProps {
  open: boolean;
  onClose: () => void;
  campaignPreview?: boolean;
  localPreviewCart?: boolean;
}

function selectionLabel(item: ReturnType<typeof useCart>["items"][number]) {
  const { size, color, model } = getCartItemOptions(item);
  const stage = getSizeStageLabel(size ?? "");
  return [stage ? `Etapa ${stage}` : null, size ? `Talle ${getSizeLabel(size)}` : null, color ? `Color ${color}` : null, model ? `Modelo ${model}` : null]
    .filter(Boolean)
    .join(" · ");
}

export function MiniCartDrawer({ open, onClose, campaignPreview, localPreviewCart }: MiniCartDrawerProps) {
  const { items, loading, updateQuantity, removeFromCart } = useCart();
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const listTotal = useMemo(() => getListSubtotal(items), [items]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[100] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
      inert={!open}
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
        data-campaign-drawer={campaignPreview || undefined}
        className={`absolute right-0 top-0 flex h-dvh w-full max-w-md flex-col bg-[#fffaf1] shadow-[0_24px_80px_rgba(49,43,30,0.22)] transition-transform duration-500 ease-soft-spring ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mini carrito"
      >
        <header className="shrink-0 border-b border-outline-variant/30 px-6 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                {localPreviewCart ? "Carrito de prueba" : "Fimy está guardando"}
              </span>
              <h2 className="mt-1 font-headline text-2xl font-extrabold text-on-surface">
                Tu bolsita suave
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {itemCount === 0
                  ? "Todavía no elegiste prendas."
                  : `${itemCount} ${itemCount === 1 ? "producto elegido" : "productos elegidos"}.`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-soft transition-transform hover:scale-105"
              aria-label="Cerrar carrito"
            >
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </div>
        </header>

        {campaignPreview && <CampaignShippingProgress subtotal={getBlackFridayTransferSubtotal(items)} />}

        {items.length === 0 && !campaignPreview ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-8 text-center">
            <div className="mb-6 rounded-[2rem] bg-[#eadfcb] p-8">
              <Image
                src="/brand/illustrations/jirafa.svg"
                alt="Fimy"
                width={120}
                height={160}
                className="h-36 w-auto opacity-80"
              />
            </div>
            <h3 className="font-headline text-2xl font-extrabold text-on-surface">
              Fimy te ayuda a elegir.
            </h3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Empezá por recién nacido, regalos con amor o esos tejidos que se sienten abrazo.
            </p>
            <Link
              href="/catalogo"
              onClick={onClose}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-soft"
            >
              Ver catálogo
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5">
              {items.length === 0 && (
                <Link href="/catalogo" onClick={onClose} className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-on-primary">
                  Ver catálogo
                </Link>
              )}
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-[1.6rem] bg-white/78 p-3 shadow-soft min-[360px]:grid-cols-[88px_minmax(0,1fr)] min-[360px]:gap-4"
                >
                  <Link href={`/producto/${item.product.slug}`} onClick={onClose} aria-label={`Ver ${item.product.name}`}>
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={88}
                      height={104}
                      className="h-24 w-full rounded-[1.2rem] object-cover min-[360px]:h-28"
                    />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/producto/${item.product.slug}`}
                          onClick={onClose}
                          className="block text-on-surface transition-colors hover:text-secondary"
                        >
                          <h3 className="line-clamp-2 font-headline text-base font-bold leading-tight">{item.product.name}</h3>
                        </Link>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {item.product.category}{selectionLabel(item) ? ` · ${selectionLabel(item)}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => removeFromCart(item.id)}
                        className="text-on-surface-variant transition-colors hover:text-error"
                        aria-label={`Quitar ${item.product.name}`}
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                      <div className="flex items-center gap-3 rounded-full bg-[#f7efe3] px-3 py-1.5">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-primary"
                          aria-label="Reducir cantidad"
                        >
                          <span className="material-symbols-outlined text-base">remove</span>
                        </button>
                        <span className="text-sm font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-primary"
                          aria-label="Aumentar cantidad"
                        >
                          <span className="material-symbols-outlined text-base">add</span>
                        </button>
                      </div>
                      <span className="font-headline text-sm font-extrabold text-secondary">
                        AR$ {(getListUnitPrice(item) * item.quantity).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
              {open && campaignPreview && <MiniCartRecommendations onClose={onClose} />}
            </div>

            {items.length > 0 && <footer className="shrink-0 border-t border-outline-variant/30 bg-white/72 px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between font-headline text-xl font-extrabold">
                <span>Total</span>
                <span className="text-primary">AR$ {listTotal.toLocaleString("es-AR")}</span>
              </div>
              {!campaignPreview && (
                <p className="mb-4 mt-1 text-xs font-semibold text-primary">
                  30% OFF pagando por transferencia
                </p>
              )}
              <div className={`grid grid-cols-2 gap-2 ${campaignPreview ? "mt-3" : ""}`}>
                <Link
                  href="/carrito"
                  onClick={onClose}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f2eadb] px-2 py-3 text-center text-sm font-bold text-primary"
                >
                  Ver carrito
                </Link>
                <SecureCheckoutLink onClick={onClose} className="text-sm" />
              </div>
            </footer>}
          </>
        )}
      </aside>
    </div>
  );
}

