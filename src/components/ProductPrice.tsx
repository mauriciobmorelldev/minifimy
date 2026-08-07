import type { ProductPriceSet } from "@/models/product";

interface ProductPriceProps {
  price: number;
  prices?: ProductPriceSet;
  compact?: boolean;
  className?: string;
}

function formatPrice(value: number) {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

function formatInstallment(value: number) {
  return `$${value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getDisplayPrice(price: number, prices?: ProductPriceSet) {
  const listPrice = prices?.list && prices.list > 0 ? prices.list : prices?.base ?? price;
  const saleCandidate = prices?.sale && prices.sale > 0 ? prices.sale : undefined;
  const salePrice = saleCandidate && saleCandidate < listPrice ? saleCandidate : undefined;
  const cardPrice = salePrice ?? listPrice;
  const discountPrice = prices?.discount && prices.discount > 0 ? prices.discount : undefined;
  const transferPrice = discountPrice && discountPrice < cardPrice ? discountPrice : undefined;
  const hasSale = Boolean(salePrice);
  const hasTransferDiscount = Boolean(transferPrice);
  const hasDiscount = hasSale || hasTransferDiscount;
  const saleDiscountPercent = hasSale ? Math.round(((listPrice - salePrice!) / listPrice) * 100) : 0;
  const discountPercent = hasTransferDiscount ? Math.round(((cardPrice - transferPrice!) / cardPrice) * 100) : saleDiscountPercent;
  const installmentAmount = cardPrice / 3;

  return {
    listPrice,
    cardPrice,
    finalPrice: transferPrice ?? cardPrice,
    salePrice,
    transferPrice,
    hasSale,
    hasTransferDiscount,
    hasDiscount,
    saleDiscountPercent,
    discountPercent,
    installmentAmount,
  };
}

export function ProductPrice({ price, prices, compact = false, className = "" }: ProductPriceProps) {
  const display = getDisplayPrice(price, prices);

  if (compact) {
    return (
      <div className={`leading-tight ${className}`}>
        {display.hasSale && (
          <div className="font-headline text-xs font-bold text-primary/60 line-through">
            Antes {formatPrice(display.listPrice)}
          </div>
        )}
        {display.hasTransferDiscount && !display.hasSale && (
          <div className="font-headline text-sm font-bold text-primary/75">
            Lista {formatPrice(display.cardPrice)}
          </div>
        )}
        <div className={`font-headline font-extrabold text-secondary ${display.hasDiscount ? "mt-1 text-[1.55rem]" : "text-xl"}`}>
          {formatPrice(display.finalPrice)}
        </div>
        {display.hasTransferDiscount ? (
          <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-secondary/80">
            con transferencia
          </div>
        ) : display.hasSale ? (
          <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-secondary/80">
            {display.saleDiscountPercent}% OFF
          </div>
        ) : null}
        <div className="mt-1.5 text-[11px] font-semibold text-primary/75">3x {formatInstallment(display.installmentAmount)}</div>
      </div>
    );
  }

  return (
    <section className={`space-y-2 ${className}`} aria-label="Precios y formas de pago">
      {display.hasSale && (
        <div className="font-headline text-base font-bold leading-none text-primary/60 line-through md:text-lg">
          Antes {formatPrice(display.listPrice)}
        </div>
      )}
      {display.hasTransferDiscount && !display.hasSale && (
        <div className="font-headline text-lg font-bold leading-none text-primary/80 md:text-xl">
          {formatPrice(display.cardPrice)}
        </div>
      )}

      <div className={`font-headline font-extrabold leading-none text-secondary ${display.hasDiscount ? "text-[2.25rem] md:text-[2.7rem]" : "text-[1.95rem] md:text-[2.35rem]"}`}>
        {formatPrice(display.finalPrice)}
        {display.hasTransferDiscount && (
          <span className="ml-2 align-middle text-base font-extrabold text-secondary/80 md:text-lg">con Transferencia</span>
        )}
      </div>

      <div className="space-y-1 pt-1 text-sm text-on-surface-variant">
        <p className="font-medium">3 x {formatInstallment(display.installmentAmount)} sin interés</p>
        {display.hasTransferDiscount ? (
          <p className="font-medium text-primary">
            {display.discountPercent}% de descuento pagando con Transferencia
          </p>
        ) : display.hasSale ? (
          <p className="font-bold text-secondary">Oferta WooCommerce: {display.saleDiscountPercent}% OFF</p>
        ) : null}
      </div>

      <button type="button" className="text-sm font-semibold text-secondary underline underline-offset-4">
        Ver medios de pago
      </button>
    </section>
  );
}
