"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const galleryImages = images.length > 0 ? images : ["/products/flatlay-01.jpg"];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];
  const hasManyImages = galleryImages.length > 1;

  const goTo = (index: number) => {
    const nextIndex = (index + galleryImages.length) % galleryImages.length;
    setActiveIndex(nextIndex);
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="relative overflow-hidden rounded-[1.6rem] bg-surface-container-low shadow-soft md:rounded-[2rem]">
        <div className="relative aspect-[4/5] md:aspect-[4/4.8]">
          <Image
            src={activeImage}
            alt={`${productName} vista ${activeIndex + 1}`}
            fill
            sizes="(min-width: 1024px) 55vw, 92vw"
            className="object-cover transition-transform duration-500 ease-soft-spring"
            priority
          />
        </div>

        <div className="absolute left-4 top-4 rounded-full bg-[#fffaf1]/95 px-3 py-2 shadow-soft backdrop-blur md:left-6 md:top-6 md:px-4">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            <span className="material-symbols-outlined text-sm">eco</span>
            Minifimy
          </span>
        </div>

        {hasManyImages && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#fffaf1]/92 text-primary shadow-soft backdrop-blur transition hover:scale-105 md:left-5"
              aria-label="Ver imagen anterior"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#fffaf1]/92 text-primary shadow-soft backdrop-blur transition hover:scale-105 md:right-5"
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
            <Image
              src={image}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
