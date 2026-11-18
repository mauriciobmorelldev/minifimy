import Link from "next/link";
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
  if (sizes.length === 0) return null;

  const groups = stages.map((stage) => ({
    ...stage,
    sizes: groupSizesByLabel(sizes.filter((size) => homeSizeStage(size) === stage.stage)),
  })).filter((group) => group.sizes.length > 0);
  const showStagesSideBySide = groups.filter((group) => group.stage).length === 2;

  return (
    <section aria-labelledby="home-age-filter-title" className="border-y border-primary/10 bg-[#fbf6ed] py-7 sm:py-9">
      <ScrollReveal>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h2 id="home-age-filter-title" className="font-headline text-2xl font-extrabold leading-tight text-primary sm:text-3xl">
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

          <div className={`mt-3 grid gap-3 sm:gap-4 ${showStagesSideBySide ? "lg:grid-cols-[1.15fr_1fr]" : ""}`}>
            {groups.map(({ stage, title, label: stageLabel, forAge, background, tile, sizes: options }) => {
              const titleId = `home-talles-${stage ?? "otros"}`;
              return (
                <section
                  key={titleId}
                  aria-labelledby={titleId}
                  className={`min-w-0 rounded-[1.35rem] border border-primary/10 p-3.5 sm:p-4 ${background} ${stage === undefined ? "lg:col-span-full" : ""}`}
                >
                  <h3 id={titleId} className="mb-3 border-b border-dashed border-primary/30 pb-2 font-headline text-lg font-extrabold leading-tight text-primary">
                    {title}
                  </h3>
                  <ul className={`grid auto-rows-fr gap-2 ${stage === "ninos"
                    ? "grid-cols-[repeat(auto-fit,minmax(3.3rem,1fr))]"
                    : "grid-cols-[repeat(auto-fit,minmax(4.1rem,1fr))]"}`}>
                    {options.map(({ label, values }) => {
                      const { value, unit } = getSizeParts(label);
                      const query = [...values.map((size) => `talle=${encodeURIComponent(size)}`), ...(stage ? [`etapa=${stage}`] : [])].join("&");

                      return (
                        <li key={label} className="min-w-0">
                          <Link
                            href={`/catalogo?${query}`}
                            aria-label={`Ver prendas en talle ${label}${forAge}`}
                            className={`flex h-full min-h-[5.4rem] flex-col items-center rounded-[0.8rem] border border-primary/15 px-1.5 pb-1.5 pt-2 text-center text-primary shadow-[0_2px_0_rgba(82,101,61,0.13)] transition-colors hover:border-primary/55 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${tile}`}
                          >
                            <span className="flex w-full flex-1 flex-col items-center justify-center gap-0.5">
                              <span className={`max-w-full font-headline font-extrabold leading-none ${unit ? "whitespace-nowrap" : "[overflow-wrap:anywhere]"} ${value.length >= 5 ? "text-base" : "text-2xl"}`}>
                                {value}
                              </span>
                              {unit && <span className="text-[0.625rem] font-semibold leading-tight">{unit}</span>}
                            </span>
                            {stageLabel && (
                              <span lang="en" className="mt-1 w-full border-t border-primary/15 pt-1 text-[0.6875rem] font-extrabold leading-none tracking-wide">
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
