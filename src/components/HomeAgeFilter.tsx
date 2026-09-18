import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";

interface HomeAgeFilterProps {
  sizes: string[];
}

const ACCENT_STYLES = [
  "bg-primary-container text-on-primary-container",
  "bg-secondary-container text-on-secondary-container",
  "bg-tertiary-container text-on-tertiary-container",
  "bg-[#f2dfb8] text-[#664d21]",
] as const;

function getSizeParts(size: string) {
  const normalized = size.trim();
  if (/^rn$/i.test(normalized)) {
    return { value: "RN", unit: "recién nacido" };
  }
  if (/^(talle )?(único|unico)$/i.test(normalized)) {
    return { value: "Único", unit: "talle" };
  }

  const age = normalized.match(/^(.+?)\s+(mes(?:es)?|año(?:s)?)$/i);
  if (age) {
    return { value: age[1], unit: age[2].toLowerCase() };
  }

  return { value: normalized.replace(/^talle\s+/i, ""), unit: "" };
}

export function HomeAgeFilter({ sizes }: HomeAgeFilterProps) {
  if (sizes.length === 0) return null;

  return (
    <section aria-labelledby="home-age-filter-title" className="relative border-y border-primary/10 bg-white/55 py-9 sm:py-12">
      <ScrollReveal>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-5 flex items-end justify-between gap-5 sm:mb-7">
            <div>
              <span className="chip">Encontrá su medida</span>
              <h2 id="home-age-filter-title" className="mt-3 font-headline text-3xl font-extrabold leading-tight sm:text-4xl">
                Comprá por edad
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 sm:text-base">
                Elegí un talle y descubrí las prendas disponibles para esa etapa.
              </p>
            </div>
            <Link
              href="/catalogo"
              className="hidden shrink-0 items-center gap-2 text-sm font-bold text-secondary underline decoration-2 underline-offset-4 sm:inline-flex"
            >
              Ver todos
              <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div
          className="overflow-x-auto scroll-smooth px-5 pb-3 [scrollbar-width:none] sm:px-8 lg:px-10 [&::-webkit-scrollbar]:hidden"
          aria-label="Talles disponibles"
        >
          <div className="mx-auto flex w-max min-w-full max-w-7xl snap-x snap-mandatory items-start gap-4 sm:gap-6 lg:justify-between">
            {sizes.map((size, index) => {
              const { value, unit } = getSizeParts(size);
              const accent = ACCENT_STYLES[index % ACCENT_STYLES.length];

              return (
                <Link
                  key={size}
                  href={`/catalogo?talle=${encodeURIComponent(size)}`}
                  aria-label={`Ver prendas en talle ${size}`}
                  className="group flex w-[6.75rem] shrink-0 snap-start flex-col items-center gap-2 text-center focus-visible:outline-none sm:w-[7.75rem]"
                >
                  <span
                    className={`flex aspect-square w-full flex-col items-center justify-center rounded-full px-2 shadow-[0_12px_30px_rgba(82,101,61,0.10)] ring-1 ring-white/80 transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03] group-hover:shadow-[0_16px_34px_rgba(82,101,61,0.18)] group-focus-visible:ring-4 group-focus-visible:ring-secondary/30 ${accent}`}
                  >
                    <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] opacity-75">Talle</span>
                    <span className={`font-headline font-extrabold leading-none ${value.length > 5 ? "text-2xl" : "text-[2.15rem] sm:text-[2.55rem]"}`}>
                      {value}
                    </span>
                    {unit ? <span className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] opacity-80">{unit}</span> : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mt-1 flex max-w-7xl items-center gap-2 px-5 text-xs font-bold text-on-surface-variant sm:hidden">
          <span className="material-symbols-outlined text-base" aria-hidden="true">swipe</span>
          Deslizá para ver todos los talles
        </div>
      </ScrollReveal>
    </section>
  );
}
