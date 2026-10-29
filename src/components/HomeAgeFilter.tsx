"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { groupSizesByLabel } from "@/lib/catalog-taxonomy";
import { getSizeStage, sizeMatchesAge, type CatalogAgeGroup } from "@/lib/catalog-age";

interface HomeAgeFilterProps {
  sizes: string[];
}

function homeSizeStage(size: string): CatalogAgeGroup | undefined {
  const stage = getSizeStage(size);
  if (stage) return stage;
  const baby = sizeMatchesAge(size, "bebes");
  const child = sizeMatchesAge(size, "ninos");
  return baby !== child ? baby ? "bebes" : "ninos" : undefined;
}

function homeSizeGroups(sizes: string[]) {
  const order = new Intl.Collator("es", { numeric: true });
  return (["bebes", "ninos", undefined] as const).flatMap((stage) =>
    groupSizesByLabel(sizes.filter((size) => homeSizeStage(size) === stage))
      .sort((first, second) => {
        const firstRN = /^rn$/i.test(first.label);
        const secondRN = /^rn$/i.test(second.label);
        return Number(secondRN) - Number(firstRN) || order.compare(first.label, second.label);
      })
      .map((group) => ({ ...group, stage }))
  );
}

function getSizeParts(size: string): { value: string; unit: string } {
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
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    setCanScrollBack(rail.scrollLeft > 4);
    setCanScrollForward(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    updateScrollState();
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(rail);

    return () => resizeObserver.disconnect();
  }, [sizes, updateScrollState]);

  const moveRail = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;

    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.72, 280),
      behavior: "smooth",
    });
  };

  if (sizes.length === 0) return null;

  return (
    <section aria-labelledby="home-age-filter-title" className="border-y border-primary/10 bg-[#fbf6ed] py-6 sm:py-7">
      <ScrollReveal>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex items-end justify-between gap-5">
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

          <div className="relative mt-4">
            <button
              type="button"
              onClick={() => moveRail(-1)}
              disabled={!canScrollBack}
              aria-label="Ver talles anteriores"
              className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-primary/15 bg-[#fffaf2]/95 text-primary shadow-soft transition hover:border-secondary/30 hover:text-secondary disabled:pointer-events-none disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">chevron_left</span>
            </button>

            <div
              ref={railRef}
              onScroll={updateScrollState}
              className="mx-11 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Talles disponibles"
            >
              <div className="flex w-max snap-x snap-mandatory items-center gap-3 pr-1 sm:gap-4">
                {homeSizeGroups(sizes).map(({ label, values, stage }) => {
                  const { value, unit } = getSizeParts(label);
                  const query = [...values.map((size) => `talle=${encodeURIComponent(size)}`), ...(stage ? [`etapa=${stage}`] : [])].join("&");

                  return (
                    <Link
                      key={`${stage ?? "other"}-${label}`}
                      href={`/catalogo?${query}`}
                      aria-label={`Ver prendas en talle ${label}${stage ? stage === "bebes" ? " para bebés" : " para niños y niñas" : ""}`}
                      className="group flex w-[4.8rem] shrink-0 snap-start items-center justify-center rounded-full focus-visible:outline-none sm:w-[5.35rem]"
                    >
                      <span className={`flex aspect-square w-full flex-col items-center justify-center rounded-full border border-primary/15 px-1 text-center text-primary shadow-[0_5px_16px_rgba(82,101,61,0.07)] transition duration-200 group-hover:-translate-y-0.5 group-hover:border-secondary/30 group-focus-visible:ring-4 group-focus-visible:ring-secondary/20 ${stage === "bebes" ? "bg-secondary-container group-hover:bg-secondary-container/80" : "bg-[#edf0e2] group-hover:bg-primary-container/55"}`}>
                        <span className="text-[0.48rem] font-extrabold uppercase tracking-[0.17em] text-primary/65">Talle</span>
                        <span className={`whitespace-nowrap font-headline font-extrabold leading-none ${value.length >= 5 ? "text-[1.22rem] sm:text-[1.38rem]" : "text-[1.65rem] sm:text-[1.9rem]"}`}>
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

            <button
              type="button"
              onClick={() => moveRail(1)}
              disabled={!canScrollForward}
              aria-label="Ver más talles"
              className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-primary/15 bg-[#fffaf2]/95 text-primary shadow-soft transition hover:border-secondary/30 hover:text-secondary disabled:pointer-events-none disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">chevron_right</span>
            </button>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
