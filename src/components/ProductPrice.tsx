import type { ProductPriceSet } from "@/models/product";

interface ProductPriceProps {
  price: number;
  prices?: ProductPriceSet;
  compact?: boolean;
  className?: string;
}

function formatPrice(value: number) {
  return `AR$ ${Math.round(value).toLocaleString("es-AR")}`;
}

export function getDisplayPrice(price: number, prices?: ProductPriceSet) {
  const listPrice = prices?.list && prices.list > 0 ? prices.list : undefined;
  const discountPrice = prices?.discount && prices.discount > 0 ? prices.discount : undefined;
  const finalPrice = discountPrice ?? prices?.base ?? price;
  const hasDiscount = Boolean(listPrice && discountPrice && discountPrice < listPrice);
  const discountPercent = hasDiscount ? Math.round(((listPrice! - discountPrice!) / listPrice!) * 100) : 0;

  return { listPrice, finalPrice, hasDiscount, discountPercent };
}

export function ProductPrice({ price, prices, compact = false, className = "" }: ProductPriceProps) {
  const { listPrice, finalPrice, hasDiscount, discountPercent } = getDisplayPrice(price, prices);

  if (compact) {
    return (
      <div className={`text-right ${className}`}>
        {hasDiscount && (
          <div className="text-[10px] font-bold text-on-surface-variant line-through">
            {formatPrice(listPrice!)}
          </div>
        )}
        <div className="font-headline text-lg font-extrabold text-secondary">{formatPrice(finalPrice)}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {hasDiscount && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-on-surface-variant line-through">{formatPrice(listPrice!)}</span>
          <span className="rounded-full bg-[#f7dfc7] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-secondary">
            {discountPercent}% off
          </span>
        </div>
      )}
      <div className="font-headline text-2xl font-semibold text-secondary md:text-3xl">{formatPrice(finalPrice)}</div>
      {hasDiscount && <p className="text-xs font-bold text-primary">Precio especial abonando con medio bonificado.</p>}
    </div>
  );
}
