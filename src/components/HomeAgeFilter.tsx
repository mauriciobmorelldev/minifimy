import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";

interface HomeAgeFilterProps {
  sizes: string[];
}

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
    <section aria-labelledby="home-age-filter-title" className="border-y border-primary/10 bg-[#fbf6ed] py-6 sm:py-7">
      <ScrollReveal>
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-5 px-5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 id="home-age-filter-title" className="font-headline text-2xl font-extrabold leading-tight text-primary sm:text-[1.7rem]">
              Elegí por edad
            </h2>
            <p className="text-sm text-on-surface-variant">
              Encontrá rápido el talle para cada etapa.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-secondary transition hover:text-secondary-dim sm:inline-flex"
          >
            Ver todos
            <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>

        <div
          className="mt-4 overflow-x-auto scroll-smooth px-5 pb-1 [scrollbar-width:none] sm:px-8 lg:px-10 [&::-webkit-scrollbar]:hidden"
          aria-label="Talles disponibles"
        >
          <div className="mx-auto flex w-max min-w-full max-w-7xl snap-x snap-mandatory items-center gap-3 sm:gap-4 lg:justify-between">
            {sizes.map((size) => {
              const { value, unit } = getSizeParts(size);

              return (
                <Link
                  key={size}
                  href={`/catalogo?talle=${encodeURIComponent(size)}`}
                  aria-label={`Ver prendas en talle ${size}`}
                  className="group flex w-[4.8rem] shrink-0 snap-start items-center justify-center rounded-full focus-visible:outline-none sm:w-[5.35rem]"
                >
                  <span className="flex aspect-square w-full flex-col items-center justify-center rounded-full border border-primary/15 bg-[#edf0e2] px-1.5 text-center text-primary shadow-[0_5px_16px_rgba(82,101,61,0.07)] transition duration-200 group-hover:-translate-y-0.5 group-hover:border-secondary/30 group-hover:bg-primary-container/55 group-focus-visible:ring-4 group-focus-visible:ring-secondary/20">
                    <span className="text-[0.48rem] font-extrabold uppercase tracking-[0.17em] text-primary/65">Talle</span>
                    <span className={`font-headline font-extrabold leading-none ${value.length > 5 ? "text-lg sm:text-xl" : "text-[1.65rem] sm:text-[1.9rem]"}`}>
                      {value}
                    </span>
                    {unit ? (
                      <span className="mt-0.5 max-w-full truncate text-[0.46rem] font-bold uppercase tracking-[0.08em] text-primary/70">
                        {unit}
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
