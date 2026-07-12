"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const galleryImages = images.length > 0 ? images : ["/products/flatlay-01.jpg"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];
  const hasManyImages = galleryImages.length > 1;

  const goTo = (index: number) => {
    const nextIndex = (index + galleryImages.length) % galleryImages.length;
    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") goTo(activeIndex - 1);
      if (event.key === "ArrowRight") goTo(activeIndex + 1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, lightboxOpen, galleryImages.length]);

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="relative overflow-hidden rounded-[1.6rem] bg-surface-container-low shadow-soft md:rounded-[2rem]">
        <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[4/4.8]">
          <Image
            src={activeImage}
            alt={`${productName} vista ${activeIndex + 1}`}
            fill
            sizes="(min-width: 1024px) 55vw, 92vw"
            className="object-cover transition-transform duration-500 ease-soft-spring"
            priority
          />
        </div>

        <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-[#fffaf1]/95 px-3 py-2 shadow-soft backdrop-blur md:left-6 md:top-6 md:px-4">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            <span className="material-symbols-outlined text-sm">eco</span>
            Minifimy
          </span>
        </div>

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-[#fffaf1]/96 px-3 py-2 text-xs font-bold text-primary shadow-soft backdrop-blur transition hover:scale-105"
          aria-label={`Ampliar imagen de ${productName}`}
        >
          <span className="material-symbols-outlined text-base">open_in_full</span>
          Ver foto
        </button>

        {hasManyImages && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#fffaf1]/92 text-primary shadow-soft backdrop-blur transition hover:scale-105 md:left-5"
              aria-label="Ver imagen anterior"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#fffaf1]/92 text-primary shadow-soft backdrop-blur transition hover:scale-105 md:right-5"
              aria-label="Ver imagen siguiente"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </>
        )}
      </div>

      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {galleryImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative h-20 min-w-20 overflow-hidden rounded-[1rem] bg-surface-container-low shadow-soft transition-all duration-300 md:h-24 md:min-w-0 md:rounded-[1.15rem] ${
              activeIndex === index ? "ring-2 ring-primary ring-offset-2 ring-offset-[#fff8ef]" : "opacity-75 hover:opacity-100"
            }`}
            aria-label={`Ver imagen ${index + 1} de ${productName}`}
            aria-current={activeIndex === index ? "true" : undefined}
          >
            <Image src={image} alt="" fill sizes="96px" className="object-cover" />
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[120] bg-[#2f2a22]/92 px-3 py-4 backdrop-blur-md md:px-8 md:py-8" role="dialog" aria-modal="true" aria-label={`Imagen ampliada de ${productName}`}>
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[#fffaf1] text-primary shadow-lift md:right-8 md:top-8"
            aria-label="Cerrar imagen"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="mx-auto flex h-full max-w-6xl flex-col gap-4">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.6rem] bg-black/10 shadow-lift md:rounded-[2rem]">
              <Image
                src={activeImage}
                alt={`${productName} vista ampliada ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
              {hasManyImages && (
                <>
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex - 1)}
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#fffaf1]/95 text-primary shadow-lift md:left-5"
                    aria-label="Imagen anterior"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(activeIndex + 1)}
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#fffaf1]/95 text-primary shadow-lift md:right-5"
                    aria-label="Imagen siguiente"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </>
              )}
            </div>

            <div className="no-scrollbar mx-auto flex max-w-full gap-3 overflow-x-auto rounded-[1.2rem] bg-[#fffaf1]/12 p-2">
              {galleryImages.map((image, index) => (
                <button
                  key={`lightbox-${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative h-16 min-w-16 overflow-hidden rounded-[0.9rem] transition ${activeIndex === index ? "ring-2 ring-[#fffaf1]" : "opacity-65"}`}
                  aria-label={`Ver imagen ampliada ${index + 1}`}
                >
                  <Image src={image} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
