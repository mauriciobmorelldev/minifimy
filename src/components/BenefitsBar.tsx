"use client";

import { useEffect, useRef, useState } from "react";

const benefits = [
  { icon: "credit_card", title: "3 cuotas sin interés" },
  { icon: "local_shipping", title: "Envíos a todo el país" },
  { icon: "support_agent", title: "Atención personalizada" },
];

export function BenefitsBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % benefits.length;
        const track = trackRef.current;
        track?.scrollTo({ left: track.clientWidth * next, behavior: "smooth" });
        return next;
      });
    }, 2800);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="bg-primary text-on-primary shadow-sm" aria-label="Beneficios de comprar en MiniFimy">
      <div
        ref={trackRef}
        onScroll={(event) => {
          const width = event.currentTarget.clientWidth;
          if (width > 0) setActiveIndex(Math.round(event.currentTarget.scrollLeft / width));
        }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain sm:hidden"
        aria-roledescription="carrusel"
      >
        {benefits.map((benefit) => (
          <div key={benefit.title} className="flex min-w-full snap-center items-center justify-center gap-3 px-6 py-4 text-center">
            <span className="material-symbols-outlined text-2xl text-[#f2d79d]" aria-hidden="true">
              {benefit.icon}
            </span>
            <span className="font-headline text-xs font-extrabold uppercase tracking-[0.13em]">
              {benefit.title}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-1.5 pb-2 sm:hidden" aria-hidden="true">
        {benefits.map((benefit, index) => (
          <span
            key={benefit.title}
            className={`h-1 rounded-full transition-all ${activeIndex === index ? "w-5 bg-[#f2d79d]" : "w-1.5 bg-white/35"}`}
          />
        ))}
      </div>

      <div className="mx-auto hidden max-w-7xl grid-cols-3 px-8 py-4 sm:grid lg:px-10">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="flex items-center justify-center gap-3 border-r border-white/20 px-3 text-center last:border-r-0">
            <span className="material-symbols-outlined text-2xl text-[#f2d79d]" aria-hidden="true">
              {benefit.icon}
            </span>
            <span className="font-headline text-sm font-extrabold uppercase tracking-[0.13em]">
              {benefit.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
