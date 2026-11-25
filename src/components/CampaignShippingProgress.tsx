import { useId } from "react";
import { formatCampaignPrice, LOCAL_SHIPPING_GOAL, NATIONAL_SHIPPING_GOAL } from "@/lib/black-friday";

const goals = [
  { amount: LOCAL_SHIPPING_GOAL, destination: "Corrientes Capital" },
  { amount: NATIONAL_SHIPPING_GOAL, destination: "Todo el país" },
];

export function CampaignShippingProgress({ subtotal, compact = false }: { subtotal: number; compact?: boolean }) {
  const titleId = useId();
  const progress = Math.min(Math.max(subtotal, 0), NATIONAL_SHIPPING_GOAL);
  const reachedNational = progress >= NATIONAL_SHIPPING_GOAL;

  return (
    <section className={`shrink-0 border-outline-variant/30 bg-white/65 ${compact ? "px-3 py-2" : "px-4 py-3 sm:px-6"}`} aria-labelledby={titleId}>
      <h3 id={titleId} className="font-headline text-sm font-extrabold text-on-surface">Envío gratis</h3>
      <div className="relative mt-3.5 mb-3">
        <div
          className="h-2.5 overflow-hidden rounded-full bg-[#e8e3db]"
          role="progressbar"
          aria-label="Progreso hacia el envío gratis a todo el país"
          aria-valuemin={0}
          aria-valuemax={NATIONAL_SHIPPING_GOAL}
          aria-valuenow={progress}
          aria-valuetext={`${formatCampaignPrice(progress)} de ${formatCampaignPrice(NATIONAL_SHIPPING_GOAL)}`}
        >
          <div className="h-full rounded-full bg-primary motion-safe:transition-[width]" style={{ width: `${(progress / NATIONAL_SHIPPING_GOAL) * 100}%` }} />
        </div>
        <span className={`absolute left-1/2 top-1/2 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary/30 ${progress >= LOCAL_SHIPPING_GOAL ? "bg-primary text-white" : "bg-white text-primary"}`} aria-hidden="true">
          <svg className="block h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 20V4m0 1c4-3 8 3 12 0v10c-4 3-8-3-12 0" />
          </svg>
        </span>
        <span className={`absolute right-0 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-primary/30 ${reachedNational ? "bg-primary text-white" : "bg-white text-primary"}`} aria-hidden="true">
          <svg className="block h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 16V6.5h12V16m0-6h4l3 3v3h-2m-5 0H8m-5.5 0H4" />
            <circle cx="6" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
          </svg>
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs leading-tight" aria-live="polite">
        {goals.map(({ amount, destination }) => (
          <div key={amount}>
            <p className="font-extrabold text-on-surface">{destination} · {formatCampaignPrice(amount)}</p>
            <p className="mt-1 text-on-surface-variant">
              {progress >= amount ? "Mínimo alcanzado" : `Te faltan ${formatCampaignPrice(amount - progress)}`}
            </p>
          </div>
        ))}
      </div>
      {!compact && <p className="mt-2 text-[11px] leading-tight text-on-surface-variant">Calculado sobre el subtotal en efectivo o por transferencia.</p>}
    </section>
  );
}
