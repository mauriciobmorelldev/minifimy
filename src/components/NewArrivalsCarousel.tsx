"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/models/product";

type NewArrivalsCarouselProps = {
  products: Product[];
};

export function NewArrivalsCarousel({ products }: NewArrivalsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);
  const visibleProducts = products.slice(0, 15);

  const getStep = useCallback(() => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>("[data-carousel-card]");
    if (!track || !card) return 0;
    return card.offsetWidth + Number.parseFloat(getComputedStyle(track).columnGap || "0");
  }, []);

  const move = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      track.scrollBy({ left: getStep() * direction, behavior: "smooth" });
    },
    [getStep],
  );

  const pauseTemporarily = useCallback(() => {
    setPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => setPaused(false), 5000);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || visibleProducts.length < 2) return;

    const centerTrack = () => {
      track.scrollLeft = track.scrollWidth / 3;
    };
    const frame = requestAnimationFrame(centerTrack);
    const onScroll = () => {
      const sectionWidth = track.scrollWidth / 3;
      if (track.scrollLeft < sectionWidth * 0.35) {
        track.scrollLeft += sectionWidth;
      } else if (track.scrollLeft > sectionWidth * 1.65) {
        track.scrollLeft -= sectionWidth;
      }
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, [visibleProducts.length]);

  useEffect(() => {
    if (paused || visibleProducts.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => move(1), 2400);
    return () => window.clearInterval(interval);
  }, [move, paused, visibleProducts.length]);

  useEffect(
    () => () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    },
    [],
  );

  if (products.length === 0) return null;
  const loopedProducts = visibleProducts.length > 1 ? [...visibleProducts, ...visibleProducts, ...visibleProducts] : visibleProducts;

  return (
    <section
      className="relative px-5 py-16 sm:px-8 lg:px-10"
      aria-labelledby="new-arrivals-title"
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.4rem] bg-[#efe4d1] px-4 py-8 shadow-soft ring-1 ring-primary/10 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl space-y-3">
            <span className="chip bg-white/75">Nuevos ingresos</span>
            <h2 id="new-arrivals-title" className="font-headline text-4xl font-extrabold leading-tight text-on-surface sm:text-5xl">
              Lo último que llegó a MiniFimy.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-on-surface-variant sm:text-base">
              Una pasadita suave por las prendas más nuevas, recién acomodadas para mirar sin apuro.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => {
                pauseTemporarily();
                move(-1);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Ver productos anteriores"
            >
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                pauseTemporarily();
                move(1);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-soft transition hover:-translate-y-0.5 hover:bg-primary-dim hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Ver productos siguientes"
            >
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </button>
            <Link href="/catalogo?orden=newest" className="ml-1 hidden items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift sm:inline-flex">
              Ver todos
            </Link>
          </div>
        </div>

        <div
          ref={trackRef}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 lg:gap-6"
          aria-label="Carrusel de nuevos ingresos"
          aria-roledescription="carrusel"
          onPointerDown={pauseTemporarily}
          onTouchStart={pauseTemporarily}
        >
          {loopedProducts.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              data-carousel-card
              aria-hidden={visibleProducts.length > 1 && (index < visibleProducts.length || index >= visibleProducts.length * 2)}
              className="w-[78vw] shrink-0 snap-start sm:w-[310px] lg:w-[300px] xl:w-[320px]"
            >
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
        <Link href="/catalogo?orden=newest" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary shadow-soft sm:hidden">
          Ver todos los nuevos ingresos
          <span className="material-symbols-outlined text-lg" aria-hidden="true">arrow_forward</span>
        </Link>
      </div>
    </section>
  );
}
