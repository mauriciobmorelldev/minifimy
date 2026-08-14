"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const heroSlides = [
  {
    src: "/brand/hero/home-banner-1.jpeg",
    alt: "Conjunto MiniFimy para bebé junto a bolsas de la marca",
  },
  {
    src: "/brand/hero/home-banner-2.jpeg",
    alt: "Mantas tejidas MiniFimy presentadas en una canasta",
  },
  {
    src: "/brand/hero/home-banner-3.jpeg",
    alt: "Prendas y accesorios MiniFimy para los primeros días del bebé",
  },
];

export function HomeHeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
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
    let fallbackTimer: number | undefined;

    fimy.style.opacity = "0";
    fimy.style.visibility = "hidden";
    fimy.style.transform = "translate3d(72px, 14px, 0) rotate(3deg) scale(0.98)";
    card.style.opacity = "0";
    card.style.visibility = "hidden";
    card.style.transform = "translate3d(46px, 10px, 0) scale(0.97)";

    const playHeroAnimation = () => {
      if (started || cancelled) return;
      started = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);

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

    const loaderIsVisible = document.querySelector(".intro-loader");
    if (loaderIsVisible) {
      window.addEventListener("minifimy:intro-complete", playHeroAnimation, { once: true });
      fallbackTimer = window.setTimeout(playHeroAnimation, 2700);
    } else {
      playHeroAnimation();
    }

    return () => {
      cancelled = true;
      window.removeEventListener("minifimy:intro-complete", playHeroAnimation);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      context?.revert();
    };
  }, []);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [paused]);

  const showSlide = (index: number) => {
    setActiveSlide((index + heroSlides.length) % heroSlides.length);
  };

  return (
    <section
      ref={heroRef}
      className="home-hero-shell px-5 pt-7 sm:px-8 sm:pt-9 lg:px-10"
      aria-label="Banner principal de MiniFimy"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        setPaused(false);
        if (startX === null || endX === undefined || Math.abs(startX - endX) < 45) return;
        showSlide(activeSlide + (startX > endX ? 1 : -1));
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="home-banner-hero relative mx-auto max-w-7xl">
        <div className="home-banner-stage absolute inset-0">
        {heroSlides.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={index === activeSlide ? slide.alt : ""}
            fill
            sizes="(min-width: 1280px) 1280px, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2.5rem)"
            className={`home-banner-image object-cover ${index === activeSlide ? "is-active" : ""}`}
            priority={index === 0}
            unoptimized
            aria-hidden={index !== activeSlide}
          />
        ))}
      </div>

        <div className="home-banner-shade" aria-hidden="true" />

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
          Descubrí nuestras prendas para tu bebé.
        </p>
        <Link
          href="/catalogo"
          className="mt-3 inline-flex min-h-9 items-center gap-1 rounded-full bg-primary px-3.5 py-2 text-xs font-bold text-on-primary transition hover:-translate-y-0.5 hover:bg-primary-dim hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Ver catálogo completo
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      </div>

        <div className="home-carousel-controls" role="group" aria-label="Controles del carrusel">
        <button
          type="button"
          className="home-carousel-arrow"
          onClick={() => showSlide(activeSlide - 1)}
          aria-label="Ver banner anterior"
        >
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </button>

        <div className="flex items-center gap-2" role="group" aria-label="Elegir banner">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              className={`home-carousel-dot ${index === activeSlide ? "is-active" : ""}`}
              onClick={() => showSlide(index)}
              aria-label={`Ver banner ${index + 1} de ${heroSlides.length}`}
              aria-current={index === activeSlide ? "true" : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          className="home-carousel-arrow"
          onClick={() => showSlide(activeSlide + 1)}
          aria-label="Ver banner siguiente"
        >
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </button>
      </div>

        <p className="sr-only" aria-live="polite">
        Banner {activeSlide + 1} de {heroSlides.length}
      </p>
      </div>
    </section>
  );
}
