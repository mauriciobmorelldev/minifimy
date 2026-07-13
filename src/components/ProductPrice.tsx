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
        <div className="font-headline text-lg font-extrabold text-[#0f4261]">{formatPrice(listPrice)}</div>
        {hasDiscount && (
          <div className="mt-1 text-[11px] font-extrabold text-[#2aa6ac]">
            {formatPrice(finalPrice)} transferencia
          </div>
        )}
        <div className="mt-1 text-[10px] font-semibold text-primary/75">3x {formatInstallment(installmentAmount)}</div>
      </div>
    );
  }

  return (
    <section className={`space-y-2 ${className}`} aria-label="Precios y formas de pago">
      <div className="font-headline text-[1.95rem] font-extrabold leading-none text-[#0f4261] md:text-[2.35rem]">
        {formatPrice(listPrice)}
      </div>

      {hasDiscount && (
        <div className="font-headline text-xl font-extrabold text-[#2aa6ac] md:text-2xl">
          {formatPrice(transferPrice!)} con Transferencia
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1 text-sm text-[#0f4261]">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#ff4c9a] text-[11px] font-extrabold text-[#ff4c9a]">
          GO
        </span>
        <span>
          Cuotas SIN interés con <strong>DÉBITO</strong>
        </span>
        {hasDiscount && (
          <span className="rounded-md border border-[#ff4c9a] px-2 py-1 text-xs font-extrabold text-[#ff4c9a]">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-[#2aa6ac]">3 x {formatInstallment(installmentAmount)} sin interés</p>
      {hasDiscount && <p className="text-sm font-medium text-[#2aa6ac]">{discountPercent}% de descuento pagando con Transferencia</p>}
      <button type="button" className="text-sm font-semibold text-[#0f4261] underline underline-offset-4">
        Ver más detalles
      </button>
    </section>
  );
}
