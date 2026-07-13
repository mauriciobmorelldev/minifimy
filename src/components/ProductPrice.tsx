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
  const listPrice = prices?.list && prices.list > 0 ? prices.list : undefined;
  const discountPrice = prices?.discount && prices.discount > 0 ? prices.discount : undefined;
  const cardPrice = listPrice ?? prices?.base ?? price;
  const transferPrice = discountPrice && discountPrice < cardPrice ? discountPrice : undefined;
  const hasDiscount = Boolean(transferPrice);
  const discountPercent = hasDiscount ? Math.round(((cardPrice - transferPrice!) / cardPrice) * 100) : 0;
  const installmentAmount = cardPrice / 3;

  return { listPrice: cardPrice, finalPrice: transferPrice ?? cardPrice, transferPrice, hasDiscount, discountPercent, installmentAmount };
}

export function ProductPrice({ price, prices, compact = false, className = "" }: ProductPriceProps) {
  const { listPrice, finalPrice, transferPrice, hasDiscount, discountPercent, installmentAmount } = getDisplayPrice(price, prices);

  if (compact) {
    return (
      <div className={`text-right leading-tight ${className}`}>
        <div className="font-headline text-lg font-extrabold text-secondary">{formatPrice(listPrice)}</div>
        {hasDiscount && (
          <div className="mt-1 text-[11px] font-extrabold text-primary">
            {formatPrice(finalPrice)} transferencia
          </div>
        )}
        <div className="mt-1 text-[10px] font-semibold text-primary/75">3x {formatInstallment(installmentAmount)}</div>
      </div>
    );
  }

  return (
    <section className={`space-y-2 ${className}`} aria-label="Precios y formas de pago">
      <div className="font-headline text-[1.95rem] font-extrabold leading-none text-secondary md:text-[2.35rem]">
        {formatPrice(listPrice)}
      </div>

      {hasDiscount && (
        <div className="font-headline text-xl font-extrabold text-primary md:text-2xl">
          {formatPrice(transferPrice!)} con Transferencia
        </div>
      )}

      <div className="space-y-1 pt-1 text-sm text-on-surface-variant">
        <p className="font-medium">3 x {formatInstallment(installmentAmount)} sin interés</p>
        {hasDiscount && (
          <p className="font-medium text-primary">
            {discountPercent}% de descuento pagando con Transferencia
          </p>
        )}
      </div>

      <button type="button" className="text-sm font-semibold text-secondary underline underline-offset-4">
        Ver medios de pago
      </button>
    </section>
  );
}
