"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";

export function HomeHeroCarousel() {
  const heroRef = useRef<HTMLElement>(null);
  const fimyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const fimy = fimyRef.current;
    const card = cardRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !hero || !fimy || !card) return;

    let context: { revert: () => void } | undefined;
    let cancelled = false;
    let started = false;

    fimy.style.opacity = "0";
    fimy.style.visibility = "hidden";
    fimy.style.transform = "translate3d(72px, 14px, 0) rotate(3deg) scale(0.98)";
    card.style.opacity = "0";
    card.style.visibility = "hidden";
    card.style.transform = "translate3d(46px, 10px, 0) scale(0.97)";

    const playHeroAnimation = () => {
      if (started || cancelled) return;
      started = true;

      void import("gsap").then(({ gsap }) => {
        if (cancelled) return;
        context = gsap.context(() => {
          const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
          timeline
            .fromTo(
              fimy,
              { autoAlpha: 0, x: 72, y: 14, rotate: 3, scale: 0.98 },
              { autoAlpha: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: 1.05 },
            )
            .fromTo(
              card,
              { autoAlpha: 0, x: 46, y: 10, scale: 0.97 },
              { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.75 },
              "-=0.5",
            );

          gsap.to(fimy, {
            y: -7,
            rotate: -0.6,
            duration: 2.6,
            delay: 1.15,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
          gsap.to(card, {
            y: -3,
            duration: 3.2,
            delay: 1.35,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        }, hero);
      });
    };

    playHeroAnimation();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="home-hero-shell px-5 pt-7 sm:px-8 sm:pt-9 lg:px-10"
      aria-label="Banner principal de MiniFimy"
    >
      <div className="home-banner-hero relative mx-auto max-w-7xl">
        <div className="home-banner-stage relative">
          <Image
            src="/brand/hero/nueva-temporada-primavera-2026.png"
            alt="MiniFimy. Nueva temporada, primavera 2026. Nuevos colores, prendas y conjuntos para acompañar cada etapa."
            width={1916}
            height={821}
            className="home-banner-image block h-auto w-full"
            preload
            unoptimized
          />
        </div>

        <div ref={fimyRef} className="home-fimy-peek" aria-hidden="true">
        <Image
          src="/brand/hero/fimy-transparent-v2.png"
          alt=""
          fill
          sizes="(min-width: 1200px) 400px, (min-width: 768px) 288px, 192px"
          className="object-cover object-center"
          priority
        />
      </div>

        <div ref={cardRef} className="home-fimy-card">
        <h1 className="flex flex-wrap items-center gap-1.5 font-headline text-lg font-extrabold leading-tight text-primary sm:text-xl">
          <span>Hola, soy Fimy</span>
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            className="shrink-0 text-[#d95f55]"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 21s-7.2-4.35-9.6-8.42C.25 8.94 2.16 4.5 6.38 4.5c2.16 0 3.55 1.2 4.36 2.43C11.55 5.7 12.94 4.5 15.1 4.5c4.22 0 6.13 4.44 3.98 8.08C16.7 16.65 12 21 12 21Z" />
          </svg>
        </h1>
        <p className="mt-1.5 text-xs font-medium leading-5 text-on-surface-variant sm:text-sm sm:leading-6">
          Descubrí nuestra nueva temporada.
        </p>
        <Link
          href="/catalogo/nueva-temporada"
          className="mt-3 inline-flex min-h-9 items-center gap-1 rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-on-primary transition hover:-translate-y-0.5 hover:bg-primary-dim hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Ver nueva temporada
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      </div>

      </div>
    </section>
  );
}
