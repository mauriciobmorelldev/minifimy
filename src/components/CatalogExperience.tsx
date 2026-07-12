"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { Category, Product, ProductFilterOptions } from "@/models/product";

interface CatalogExperienceProps {
  products: Product[];
  categories: Category[];
  filterOptions: ProductFilterOptions;
}

const PRODUCTS_PER_PAGE = 12;

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSafePage(value: string | null) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function formatPrice(value: number) {
  return `AR$ ${Math.round(value).toLocaleString("es-AR")}`;
}

function clampPrice(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parsePriceRange(value: string, min: number, max: number) {
  if (!max || min >= max || value === "all") return { min, max, isDefault: true };

  const [rawMin, rawMax] = value.split("-").map(Number);
  const nextMin = clampPrice(Number.isFinite(rawMin) ? rawMin : min, min, max);
  const nextMax = clampPrice(Number.isFinite(rawMax) ? rawMax : max, min, max);
  const sortedMin = Math.min(nextMin, nextMax);
  const sortedMax = Math.max(nextMin, nextMax);

  return { min: sortedMin, max: sortedMax, isDefault: sortedMin === min && sortedMax === max };
}

function serializePriceRange(min: number, max: number, limitMin: number, limitMax: number) {
  return min <= limitMin && max >= limitMax ? "all" : `${Math.round(min)}-${Math.round(max)}`;
}

export function CatalogExperience({ products, categories, filterOptions }: CatalogExperienceProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("categoria") ?? "all");
  const [size, setSize] = useState(searchParams.get("talle") ?? "all");
  const [color, setColor] = useState(searchParams.get("color") ?? "all");
  const [priceRange, setPriceRange] = useState(searchParams.get("precio") ?? "all");
  const [sort, setSort] = useState(searchParams.get("orden") ?? "featured");
  const [page, setPage] = useState(getSafePage(searchParams.get("page")));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setCategory(searchParams.get("categoria") ?? "all");
    setSize(searchParams.get("talle") ?? "all");
    setColor(searchParams.get("color") ?? "all");
    setPriceRange(searchParams.get("precio") ?? "all");
    setSort(searchParams.get("orden") ?? "featured");
    setPage(getSafePage(searchParams.get("page")));
  }, [searchParams]);

  const updateUrl = (next: Record<string, string | number | null>) => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all" || value === "featured" || value === 1) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
    window.history.replaceState(null, "", nextUrl);
  };

  const setFilter = (next: Partial<{ q: string; categoria: string; talle: string; color: string; precio: string; orden: string }>) => {
    const nextQuery = next.q ?? query;
    const nextCategory = next.categoria ?? category;
    const nextSize = next.talle ?? size;
    const nextColor = next.color ?? color;
    const nextPriceRange = next.precio ?? priceRange;
    const nextSort = next.orden ?? sort;

    setQuery(nextQuery);
    setCategory(nextCategory);
    setSize(nextSize);
    setColor(nextColor);
    setPriceRange(nextPriceRange);
    setSort(nextSort);
    setPage(1);
    updateUrl({ q: nextQuery, categoria: nextCategory, talle: nextSize, color: nextColor, precio: nextPriceRange, orden: nextSort, page: 1 });
  };

  const priceMinLimit = Math.floor((filterOptions.price.min || 0) / 100) * 100;
  const priceMaxLimit = Math.ceil((filterOptions.price.max || 0) / 100) * 100;
  const hasPriceSlider = priceMaxLimit > priceMinLimit;
  const priceStep = 1;
  const selectedPriceRange = parsePriceRange(priceRange, priceMinLimit, priceMaxLimit);
  const priceFillLeft = hasPriceSlider ? ((selectedPriceRange.min - priceMinLimit) / (priceMaxLimit - priceMinLimit)) * 100 : 0;
  const priceFillRight = hasPriceSlider ? 100 - ((selectedPriceRange.max - priceMinLimit) / (priceMaxLimit - priceMinLimit)) * 100 : 0;

  const updatePriceSlider = (edge: "min" | "max", value: string) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;

    const nextMin = edge === "min" ? Math.min(numericValue, selectedPriceRange.max - priceStep) : selectedPriceRange.min;
    const nextMax = edge === "max" ? Math.max(numericValue, selectedPriceRange.min + priceStep) : selectedPriceRange.max;
    setFilter({ precio: serializePriceRange(nextMin, nextMax, priceMinLimit, priceMaxLimit) });
  };

  const quickFilters = [
    ...filterOptions.categories.slice(0, 3).map((item) => ({
      label: item.name,
      icon: "category",
      action: () => setFilter({ categoria: item.slug }),
    })),
    ...(filterOptions.sizes[0]
      ? [{ label: `Talle ${filterOptions.sizes[0]}`, icon: "straighten", action: () => setFilter({ talle: filterOptions.sizes[0] }) }]
      : []),
  ].slice(0, 4);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    const filtered = products.filter((product) => {
      const haystack = normalize(
        [product.name, product.description, product.category, product.badge, ...(product.sizes ?? []), ...(product.colors ?? [])]
          .filter(Boolean)
          .join(" "),
      );
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesCategory = category === "all" || product.category === category || product.categorySlugs?.includes(category);
      const matchesSize = size === "all" || product.sizes?.includes(size);
      const matchesColor = color === "all" || product.colors?.includes(color);
      const matchesPrice = !hasPriceSlider || (product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max);
      return matchesQuery && matchesCategory && matchesSize && matchesColor && matchesPrice;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "newest") return String(b.id).localeCompare(String(a.id));
      return 0;
    });
  }, [category, color, hasPriceSlider, products, query, selectedPriceRange.max, selectedPriceRange.min, size, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(pageStart, pageStart + PRODUCTS_PER_PAGE);
  const selectedCategoryName = categories.find((item) => item.slug === category)?.name ?? category;
  const selectedPriceName = !selectedPriceRange.isDefault ? `${formatPrice(selectedPriceRange.min)} - ${formatPrice(selectedPriceRange.max)}` : "";
  const activeFilters = [query, category !== "all" ? selectedCategoryName : "", size !== "all" ? size : "", color !== "all" ? color : "", selectedPriceName].filter(Boolean);

  const goToPage = (nextPage: number) => {
    const boundedPage = Math.min(Math.max(nextPage, 1), totalPages);
    setPage(boundedPage);
    updateUrl({ page: boundedPage });
    window.requestAnimationFrame(() => {
      document.getElementById("catalog-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const resetFilters = () => {
    setMobileFiltersOpen(false);
    setFilter({ q: "", categoria: "all", talle: "all", color: "all", precio: "all", orden: "featured" });
  };

  return (
    <main className="mobile-soft-page relative overflow-hidden bg-[#fff8ef] pb-16 pt-24 md:pb-20">
      <div className="pointer-events-none absolute inset-0 opacity-[0.055]">
        <Image src="/brand/patterns/pattern-01.png" alt="" fill sizes="100vw" className="object-cover" />
      </div>

      <section className="relative mx-auto max-w-7xl px-4 md:px-6">
        <ScrollReveal>
          <div className="catalog-hero relative overflow-hidden rounded-[1.8rem] bg-[#efe4d0] px-4 py-6 shadow-soft md:rounded-[2.4rem] md:px-10 md:py-12">
            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <span className="inline-flex rounded-full bg-white/72 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary shadow-soft">
                  Fimy te ayuda a encontrar
                </span>
                <h1 className="mt-5 max-w-3xl font-headline text-[2.15rem] font-extrabold leading-[1.02] tracking-tight text-on-surface md:mt-6 md:text-6xl">
                  EncontrÃ¡ esa prenda que se siente elegida con amor.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant md:mt-5 md:text-lg md:leading-8">
                  BuscÃ¡ por momento, talle o tipo de regalo. El catÃ¡logo se acomoda para que comprar sea mÃ¡s simple, mÃ¡s cÃ¡lido y menos abrumador.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] md:mt-7">
                  <label className="relative block">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">search</span>
                    <input
                      value={query}
                      onChange={(event) => setFilter({ q: event.target.value })}
                      placeholder="Buscar body, ajuar, manta, regalo..."
                      className="h-12 w-full rounded-full bg-white/88 pl-11 pr-4 text-sm font-medium text-on-surface shadow-soft outline-none ring-1 ring-white/60 transition focus:ring-2 focus:ring-primary/30 md:h-14 md:pl-12 md:pr-5"
                    />
                  </label>
                  <select
                    value={sort}
                    onChange={(event) => setFilter({ orden: event.target.value })}
                    className="h-12 rounded-full bg-white/88 px-4 text-sm font-bold text-primary shadow-soft outline-none ring-1 ring-white/60 md:h-14 md:px-5"
                    aria-label="Ordenar productos"
                  >
                    <option value="featured">Elegidos por Fimy</option>
                    <option value="newest">MÃ¡s nuevos</option>
                    <option value="price-asc">Menor precio</option>
                    <option value="price-desc">Mayor precio</option>
                  </select>
                </div>
              </div>

              <div className="relative hidden min-h-[330px] lg:block">
                <div className="absolute right-0 top-4 h-72 w-72 rounded-full bg-white/30 blur-sm" />
                <div className="absolute right-24 top-2 rotate-[-7deg] rounded-[2rem] bg-white p-3 shadow-lift">
                  <Image
                    src={products[0]?.images[0] ?? "/brand/illustrations/jirafa.svg"}
                    alt="Producto destacado"
                    width={230}
                    height={280}
                    className="h-72 w-56 rounded-[1.5rem] object-cover"
                    priority
                  />
                  <p className="mt-3 px-2 pb-2 font-headline text-lg font-extrabold text-on-surface">
                    {products[0]?.name ?? "PequeÃ±a joyita"}
                  </p>
                </div>
                <div className="absolute bottom-2 right-0 max-w-[230px] rounded-[1.7rem] bg-white/82 px-5 py-4 text-sm font-semibold leading-6 text-on-surface-variant shadow-soft">
                  â€œSi es para regalar, empezarÃ­a por acÃ¡.â€
                </div>
                <Image
                  src="/brand/illustrations/jirafa.svg"
                  alt="Fimy"
                  width={120}
                  height={180}
                  className="absolute bottom-0 left-14 h-44 w-auto opacity-80"
                  priority
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-6 md:mt-8">
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={filter.action}
                className="group min-w-[72%] snap-start rounded-[1.35rem] bg-white/76 p-4 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:bg-white sm:min-w-[42%] md:min-w-0 md:rounded-[1.6rem] md:p-5"
              >
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#f7efe3] text-primary transition-transform group-hover:rotate-[-8deg]">
                  <span className="material-symbols-outlined">{filter.icon}</span>
                </span>
                <span className="font-headline text-lg font-extrabold text-on-surface">{filter.label}</span>
                <span className="mt-2 block text-sm text-on-surface-variant">Ver opciones reales</span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div className="relative z-10 mt-8 grid gap-6 lg:mt-12 lg:grid-cols-[300px_1fr] lg:gap-8">
          <aside className="h-fit rounded-[1.6rem] bg-white/82 p-4 shadow-soft ring-1 ring-white/70 lg:sticky lg:top-28 lg:rounded-[2rem] lg:p-5" aria-label="Filtros de catÃ¡logo">
            <div className="mb-4 flex items-center justify-between gap-4 lg:mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Fimy filtra por vos</span>
                <h2 className="font-headline text-xl font-extrabold text-on-surface md:text-2xl">Elegir con calma</h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((open) => !open)}
                className="rounded-full bg-[#f7efe3] px-3 py-2 text-xs font-bold text-primary lg:hidden"
                aria-expanded={mobileFiltersOpen}
              >
                {mobileFiltersOpen ? "Cerrar" : "Abrir"}
              </button>
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="hidden text-xs font-bold text-secondary lg:block"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className={`${mobileFiltersOpen ? "block" : "hidden"} space-y-5 lg:block`}>
              <p className="rounded-[1.2rem] bg-[#f7efe3] px-4 py-3 text-xs font-semibold leading-5 text-primary/85">
                Usamos las categorias, talles, colores y precios reales cargados en Fimy.
              </p>
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Categoria</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilter({ categoria: "all" })}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${category === "all" ? "bg-primary text-on-primary" : "bg-[#f7efe3] text-primary hover:bg-primary-container"}`}
                  >
                    Todo Minifimy
                  </button>
                  {categories.slice(0, 10).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter({ categoria: item.slug })}
                      className={`rounded-full px-4 py-2 text-sm font-bold transition ${category === item.slug ? "bg-primary text-on-primary" : "bg-[#f7efe3] text-primary hover:bg-primary-container"}`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Talle</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilter({ talle: "all" })}
                    className={`rounded-full px-4 py-2 text-sm font-bold ${size === "all" ? "bg-secondary text-on-secondary" : "bg-[#f7efe3] text-primary"}`}
                  >
                    Todos
                  </button>
                  {filterOptions.sizes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFilter({ talle: item })}
                      className={`rounded-full px-4 py-2 text-sm font-bold ${size === item ? "bg-secondary text-on-secondary" : "bg-[#f7efe3] text-primary"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {filterOptions.colors.length > 0 && (
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFilter({ color: "all" })}
                      className={`rounded-full px-4 py-2 text-sm font-bold ${color === "all" ? "bg-secondary text-on-secondary" : "bg-[#f7efe3] text-primary"}`}
                    >
                      Todos
                    </button>
                    {filterOptions.colors.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setFilter({ color: item })}
                        className={`rounded-full px-4 py-2 text-sm font-bold ${color === item ? "bg-secondary text-on-secondary" : "bg-[#f7efe3] text-primary"}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasPriceSlider && (
                <div className="rounded-[1.4rem] bg-[#f7efe3] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Precio</h3>
                    <button
                      type="button"
                      onClick={() => setFilter({ precio: "all" })}
                      className="text-xs font-bold text-secondary disabled:opacity-40"
                      disabled={selectedPriceRange.isDefault}
                    >
                      Reiniciar
                    </button>
                  </div>

                  <div className="mb-5 grid grid-cols-2 gap-2">
                    <div className="rounded-[1rem] bg-white/80 px-3 py-2 shadow-soft">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-primary/70">Desde</span>
                      <strong className="mt-1 block text-sm text-on-surface">{formatPrice(selectedPriceRange.min)}</strong>
                    </div>
                    <div className="rounded-[1rem] bg-white/80 px-3 py-2 text-right shadow-soft">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-primary/70">Hasta</span>
                      <strong className="mt-1 block text-sm text-on-surface">{formatPrice(selectedPriceRange.max)}</strong>
                    </div>
                  </div>

                  <div className="relative h-9 px-1" aria-label="Rango de precio">
                    <div className="absolute left-1 right-1 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white shadow-inner" />
                    <div
                      className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary/80"
                      style={{ left: `${priceFillLeft}%`, right: `${priceFillRight}%` }}
                    />
                    <input
                      type="range"
                      min={priceMinLimit}
                      max={priceMaxLimit}
                      step={priceStep}
                      value={selectedPriceRange.min}
                      onChange={(event) => updatePriceSlider("min", event.target.value)}
                      className={`price-range-thumb absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2 appearance-none bg-transparent ${selectedPriceRange.min > priceMaxLimit - (priceMaxLimit - priceMinLimit) * 0.12 ? "z-30" : "z-10"}`}
                      aria-label="Precio minimo"
                    />
                    <input
                      type="range"
                      min={priceMinLimit}
                      max={priceMaxLimit}
                      step={priceStep}
                      value={selectedPriceRange.max}
                      onChange={(event) => updatePriceSlider("max", event.target.value)}
                      className="price-range-thumb absolute inset-x-0 top-1/2 z-20 h-2 w-full -translate-y-1/2 appearance-none bg-transparent"
                      aria-label="Precio maximo"
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[11px] font-bold text-primary/70">
                    <span>{formatPrice(priceMinLimit)}</span>
                    <span>{formatPrice(priceMaxLimit)}</span>
                  </div>
                </div>
              )}

              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full rounded-full bg-white px-4 py-3 text-sm font-bold text-secondary shadow-soft lg:hidden"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </aside>

          <section id="catalog-products" className="scroll-mt-28">
            <div className="mb-5 flex flex-col justify-between gap-3 rounded-[1.35rem] bg-white/66 px-4 py-3 shadow-soft sm:flex-row sm:items-center md:mb-6 md:rounded-[1.6rem] md:px-5 md:py-4">
              <div>
                <p className="text-sm font-bold text-on-surface">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "producto encontrado" : "productos encontrados"}
                </p>
                <p className="text-xs text-on-surface-variant">
                  PÃ¡gina {currentPage} de {totalPages}. Mostrando {paginatedProducts.length} por tanda para cuidar performance.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <span key={filter} className="rounded-full bg-[#f7efe3] px-3 py-1 text-xs font-bold text-primary">
                    {filter}
                  </span>
                ))}
              </div>
            </div>

            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-7 xl:grid-cols-3">
                  {paginatedProducts.map((product, index) => (
                    <ScrollReveal key={product.id} delayMs={Math.min(index * 45, 260)}>
                      <ProductCard product={product} />
                    </ScrollReveal>
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="PaginaciÃ³n de productos">
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary shadow-soft disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => goToPage(pageNumber)}
                        className={`h-10 w-10 rounded-full text-sm font-extrabold shadow-soft ${pageNumber === currentPage ? "bg-primary text-on-primary" : "bg-white text-primary"}`}
                        aria-current={pageNumber === currentPage ? "page" : undefined}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rounded-full bg-white px-4 py-2 text-sm font-bold text-primary shadow-soft disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <div className="rounded-[2rem] bg-white/72 p-10 text-center shadow-soft">
                <Image
                  src="/brand/illustrations/jirafa.svg"
                  alt="Fimy"
                  width={92}
                  height={140}
                  className="mx-auto mb-5 h-32 w-auto opacity-75"
                />
                <h3 className="font-headline text-xl font-extrabold text-on-surface md:text-2xl">Fimy no encontro algo exacto.</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-on-surface-variant">
Proba con â€œregaloâ€, â€œrecien nacidoâ€, â€œbodyâ€ o limpia filtros para volver a ver toda la coleccion.
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="mt-10 md:mt-14">
          <ProductCarousel
            title="TambiÃ©n puede gustarte"
            description="Una selecciÃ³n suave para seguir mirando sin perder el hilo."
            products={products.slice(0, 8)}
          />
        </div>
      </section>
    </main>
  );
}
