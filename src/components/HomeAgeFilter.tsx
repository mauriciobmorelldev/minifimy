"use client";

import Link from "next/link";
import { useState } from "react";
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

const stages = [
  { stage: "bebes", title: "Bebés", label: "Baby", forAge: " para bebés", background: "bg-secondary-container/60", tile: "bg-[#fff9f4]" },
  { stage: "ninos", title: "Niños y niñas", label: "Kids", forAge: " para niños y niñas", background: "bg-[#edf0e2]", tile: "bg-[#f9fbf4]" },
  { stage: undefined, title: "Otros talles", label: "", forAge: "", background: "bg-white/70", tile: "bg-white" },
] as const;

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
  const [mobileStage, setMobileStage] = useState<CatalogAgeGroup | "otros">("bebes");
  if (sizes.length === 0) return null;

  const groups = stages.map((stage) => ({
    ...stage,
    sizes: groupSizesByLabel(sizes.filter((size) => homeSizeStage(size) === stage.stage)),
  })).filter((group) => group.sizes.length > 0);
  const showStagesSideBySide = groups.filter((group) => group.stage).length === 2;
  const activeGroup = groups.find((group) => (group.stage ?? "otros") === mobileStage) ?? groups[0];
  const showStageSwitcher = groups.length > 1;

  return (
    <section aria-labelledby="home-age-filter-title" className="border-y border-primary/10 bg-[#fbf6ed] py-3 sm:py-9">
      <ScrollReveal>
        <div className="mx-auto max-w-7xl px-3 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-x-3 sm:gap-x-4 sm:gap-y-2">
            <h2 id="home-age-filter-title" className="font-headline text-xl font-extrabold leading-tight text-primary sm:text-3xl">
              Comprá por talle
            </h2>
            <Link
              href="/catalogo"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-bold text-primary underline decoration-primary/35 underline-offset-4 hover:decoration-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Ver catálogo
              <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>

          {showStageSwitcher && (
            <div role="group" aria-label="Etapa del talle" className="mb-1.5 flex gap-1 rounded-full border border-primary/15 bg-white/55 p-0.5 sm:hidden">
              {groups.map((group) => (
                <button
                  key={group.stage ?? "otros"}
                  type="button"
                  aria-pressed={activeGroup === group}
                  aria-controls={`home-size-panel-${group.stage ?? "otros"}`}
                  onClick={() => setMobileStage(group.stage ?? "otros")}
                  className={`min-h-11 min-w-0 flex-1 rounded-full px-2 text-sm font-extrabold text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                    activeGroup === group ? `${group.background} ring-1 ring-inset ring-primary/20` : "hover:bg-primary/5"
                  }`}
                >
                  {group.label ? <span lang="en">{group.label}</span> : group.title}
                </button>
              ))}
            </div>
          )}
          <div className={`grid sm:mt-3 sm:gap-4 ${showStagesSideBySide ? "lg:grid-cols-[1.15fr_1fr]" : ""}`}>
            {groups.map(({ stage, title, label: stageLabel, forAge, background, tile, sizes: options }) => {
              const titleId = `home-talles-${stage ?? "otros"}`;
              return (
                <section
                  key={titleId}
                  id={`home-size-panel-${stage ?? "otros"}`}
                  aria-labelledby={titleId}
                  className={`min-w-0 rounded-xl border border-primary/10 p-2 sm:block sm:rounded-[1.35rem] sm:p-4 ${background} ${stage === undefined ? "lg:col-span-full" : ""} ${stage === activeGroup.stage ? "" : "hidden"}`}
                >
                  <h3 id={titleId} className={`mb-1 font-headline font-extrabold leading-tight text-primary sm:mb-3 sm:border-b sm:border-dashed sm:border-primary/30 sm:pb-2 sm:text-lg ${showStageSwitcher ? "sr-only sm:not-sr-only" : ""}`}>
                    {title}
                  </h3>
                  <ul className={`grid auto-rows-fr grid-cols-[repeat(auto-fit,minmax(2.75rem,1fr))] gap-1 sm:gap-2 ${stage === "ninos"
                    ? "sm:grid-cols-[repeat(auto-fit,minmax(3.3rem,1fr))]"
                    : "sm:grid-cols-[repeat(auto-fit,minmax(4.1rem,1fr))]"}`}>
                    {options.map(({ label, values }) => {
                      const { value, unit } = getSizeParts(label);
                      const query = [...values.map((size) => `talle=${encodeURIComponent(size)}`), ...(stage ? [`etapa=${stage}`] : [])].join("&");

                      return (
                        <li key={label} className="min-w-0">
                          <Link
                            href={`/catalogo?${query}`}
                            aria-label={`Ver prendas en talle ${label}${forAge}`}
                            className={`mx-auto flex size-11 flex-col items-center justify-center rounded-full border border-primary/15 px-0.5 text-center text-primary shadow-[0_2px_0_rgba(82,101,61,0.13)] transition-colors hover:border-primary/55 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:aspect-square sm:h-auto sm:w-full sm:max-w-[5.35rem] sm:px-1.5 ${tile}`}
                          >
                            <span className="flex w-full flex-col items-center gap-px">
                              <span className={`max-w-full font-headline font-extrabold leading-none ${unit ? "whitespace-nowrap" : "[overflow-wrap:anywhere]"} ${value.length >= 5 ? "text-xs sm:text-base" : "text-base sm:text-2xl"}`}>
                                {value}
                              </span>
                              {unit && <span className={`text-[0.625rem] font-semibold leading-tight ${value === "RN" ? "sr-only sm:not-sr-only" : ""}`}>{unit}</span>}
                            </span>
                            {stageLabel && (
                              <span lang="en" className="mt-0.5 text-[0.625rem] font-extrabold leading-none sm:mt-1 sm:text-[0.6875rem] sm:tracking-wide">
                                {stageLabel}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
