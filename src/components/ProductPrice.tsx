"use client";

import type { ProductPriceSet } from "@/models/product";
import { useBlackFridayCampaign } from "@/context/black-friday-context";
import { BLACK_FRIDAY_DISCOUNT, BLACK_FRIDAY_INSTALLMENTS, formatBlackFridayInstallment, formatBlackFridayPrice, getBlackFridayPrice } from "@/lib/black-friday";

interface ProductPriceProps {
  price: number;
  prices?: ProductPriceSet;
  compact?: boolean;
  className?: string;
  onShowPaymentMethods?: () => void;
}

function formatPrice(value: number) {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

function formatRoundedInstallment(value: number) {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

export function getDisplayPrice(price: number, prices?: ProductPriceSet) {
  const listPrice = prices?.list && prices.list > 0 ? prices.list : undefined;
  const discountPrice = prices?.discount && prices.discount > 0 ? prices.discount : undefined;
  const cardPrice = listPrice ?? prices?.base ?? price;
  const transferPrice = discountPrice && discountPrice < cardPrice ? discountPrice : undefined;
  const hasDiscount = Boolean(transferPrice);
  const discountPercent = hasDiscount ? Math.round(((cardPrice - transferPrice!) / cardPrice) * 100) : 0;
  const installmentAmount = cardPrice / 3;

  return { listPrice: cardPrice, finalPrice: transferPrice ?? cardPrice, transferPrice, hasDiscount, discountPercent, installmentAmount };
}

export function ProductPrice({ price, prices, compact = false, className = "", onShowPaymentMethods }: ProductPriceProps) {
  const { listPrice, finalPrice, transferPrice, hasDiscount, discountPercent, installmentAmount } = getDisplayPrice(price, prices);
  const campaignActive = useBlackFridayCampaign();
  const campaignPrice = campaignActive ? getBlackFridayPrice(price, prices) : undefined;

  if (campaignPrice) {
    return (
      <section className={`space-y-1 leading-tight ${className}`} aria-label="Precio Black Friday">
        <p className="text-sm font-semibold text-on-surface-variant">
          Precio {formatBlackFridayPrice(campaignPrice.original)}
        </p>
        <p data-product-price className="font-headline text-2xl font-extrabold text-secondary">
          {formatBlackFridayPrice(campaignPrice.final)}
        </p>
        {compact ? <p className="text-xs font-semibold text-on-surface-variant">Por transferencia</p> : (
          <div className="grid gap-2 pt-2 [&>p]:rounded-xl [&>p]:border [&>p]:border-secondary/20 [&>p]:px-3 [&>p]:py-2 [&>p]:text-sm [&>p]:font-semibold [&>p]:leading-tight">
            <p className="bg-secondary text-white">
              {BLACK_FRIDAY_DISCOUNT}% de descuento por transferencia
            </p>
            <p className="bg-[#f7e5e5] text-on-surface">
              {BLACK_FRIDAY_INSTALLMENTS} cuotas sin interés de <strong className="whitespace-nowrap text-secondary">{formatBlackFridayInstallment(campaignPrice.original)}</strong>
            </p>
          </div>
        )}
        {onShowPaymentMethods && (
          <button type="button" onClick={onShowPaymentMethods} className="text-sm font-semibold text-secondary underline underline-offset-4">
            Ver medios de pago
          </button>
        )}
      </section>
    );
  }

  if (compact) {
    return (
      <div className={`leading-tight ${className}`}>
        <div className="font-headline text-sm font-bold text-primary/75">
          {hasDiscount ? `Lista ${formatPrice(listPrice)}` : "Precio de lista"}
        </div>
        <div data-product-price className={`font-headline font-extrabold text-secondary ${hasDiscount ? "mt-1 text-[1.55rem]" : "text-xl"}`}>
          {hasDiscount ? formatPrice(finalPrice) : formatPrice(listPrice)}
        </div>
        {hasDiscount && (
          <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-secondary/80">
            con transferencia
          </div>
        )}
        <div className="mt-1.5 text-[11px] font-semibold text-primary/75">3 cuotas sin interés · {formatRoundedInstallment(installmentAmount)}</div>
      </div>
    );
  }

  return (
    <section className={`space-y-2 ${className}`} aria-label="Precios y formas de pago">
      <p data-product-price={!hasDiscount || undefined} className="font-headline text-lg font-bold leading-none text-primary/80 md:text-xl">
        Precio de lista: {formatPrice(listPrice)}
      </p>
      {hasDiscount && (
        <p data-product-price className="font-headline text-[1.8rem] font-extrabold leading-none text-secondary md:text-[2.15rem]">
          Precio por transferencia: {formatPrice(transferPrice!)}
        </p>
      )}

      <div className="space-y-1 pt-1 text-sm text-on-surface-variant">
        <p className="font-medium">3 cuotas sin interés de {formatRoundedInstallment(installmentAmount)}</p>
        {hasDiscount && (
          <p className="font-medium text-primary">
            {discountPercent}% de descuento pagando por transferencia
          </p>
        )}
      </div>

      {onShowPaymentMethods && (
        <button type="button" onClick={onShowPaymentMethods} className="text-sm font-semibold text-secondary underline underline-offset-4">
          Ver medios de pago
        </button>
      )}
    </section>
  );
}
