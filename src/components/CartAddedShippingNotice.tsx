"use client";

import { useEffect, useId } from "react";
import { CampaignShippingProgress } from "@/components/CampaignShippingProgress";

export function CartAddedShippingNotice({ subtotal, onClose }: { subtotal: number; onClose: () => void }) {
  const titleId = useId();

  useEffect(() => {
    const timeout = window.setTimeout(onClose, 5500);
    return () => window.clearTimeout(timeout);
  }, [onClose]);

  return (
    <section
      aria-labelledby={titleId}
      className="cart-added-notice pointer-events-none fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[110] ml-auto max-w-sm rounded-[12px] border border-outline-variant/40 bg-[#fffaf1] p-2 text-on-surface shadow-xl sm:inset-x-auto sm:right-5 sm:w-full"
    >
      <div className="flex items-center justify-between gap-2 pl-2">
        <h2 id={titleId} role="status" className="font-headline text-sm font-extrabold">Agregado a tu bolsita</h2>
        <button type="button" onClick={onClose} className="pointer-events-auto grid h-11 w-11 shrink-0 place-items-center rounded-full text-on-surface hover:bg-white" aria-label="Cerrar aviso de envío">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <div className="overflow-hidden rounded-[8px] border border-outline-variant/30">
        <CampaignShippingProgress subtotal={subtotal} compact />
      </div>
    </section>
  );
}
