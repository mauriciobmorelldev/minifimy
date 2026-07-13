"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { productNeedsOptions } from "@/lib/product-options";
import type { Product } from "@/models/product";

type GuideIntent = {
  id: string;
  label: string;
  title: string;
  note: string;
  categories: string[];
  keywords: string[];
};

const intents: GuideIntent[] = [
  {
    id: "newborn",
    label: "Recien nacido",
    title: "Si es para un recien nacido, empezaria por estas prendas.",
    note: "Busco suavidad, broches comodos y colores que combinen con todo.",
    categories: ["recien-nacido"],
    keywords: ["body", "nido", "manta"],
  },
  {
    id: "baby-shower",
    label: "Baby shower",
    title: "Para baby shower conviene algo tierno, util y facil de regalar.",
    note: "Me gustan los sets, mantas y piezas que se sienten especiales al abrir la caja.",
    categories: ["recien-nacido", "accesorios"],
    keywords: ["set", "manta", "gorro"],
  },
  {
    id: "cozy",
    label: "Algo abrigado",
    title: "Para dias tranquilos, iria por texturas suaves y mucho abrigo.",
    note: "Pijamas, mantas y tejidos que acompanan siestas largas.",
    categories: ["dormir"],
    keywords: ["pijama", "manta", "brisa"],
  },
  {
    id: "fimy",
    label: "Sorprendeme",
    title: "Encontre algunas pequenas joyitas para mirar sin apuro.",
    note: "Una seleccion corta para que elegir no se sienta enorme.",
    categories: [],
    keywords: [],
  },
];

type FimiGiftGuideProps = {
  products: Product[];
  title: string;
  intro: string;
};

export function FimiGiftGuide({ products, title, intro }: FimiGiftGuideProps) {
  const [selectedIntent, setSelectedIntent] = useState(intents[0].id);
  const activeIntent = intents.find((intent) => intent.id === selectedIntent) ?? intents[0];

  const recommended = useMemo(() => {
    const matches = products.filter((product) => {
      const byCategory = activeIntent.categories.includes(product.category);
      const searchable = `${product.name} ${product.description} ${product.badge ?? ""}`.toLowerCase();
      const byKeyword = activeIntent.keywords.some((keyword) => searchable.includes(keyword));
      return byCategory || byKeyword || activeIntent.id === "fimy";
    });

    return (matches.length > 0 ? matches : products).slice(0, 3);
  }, [activeIntent, products]);

  return (
    <section className="fimy-guide px-5 py-20 sm:px-8 lg:px-10" aria-labelledby="fimy-guide-title">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="fimy-guide-panel relative overflow-hidden bg-[#efe4d1] p-7 shadow-soft sm:p-9">
          <Image
            src="/brand/illustrations/jirafa.svg"
            alt="Fimy"
            width={130}
            height={190}
            className="fimy-float absolute -bottom-4 -right-2 w-24 opacity-80 sm:w-32"
          />
          <span className="chip bg-white/70">Fimy te ayuda</span>
          <h2 id="fimy-guide-title" className="mt-6 max-w-lg font-headline text-4xl font-extrabold leading-tight text-on-surface">
            {title}
          </h2>
          <p className="mt-4 max-w-md leading-7 text-on-surface-variant">
            {intro}
          </p>
          <div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="Intencion de compra">
            {intents.map((intent) => (
              <button
                key={intent.id}
                type="button"
                role="tab"
                aria-selected={intent.id === selectedIntent}
                onClick={() => setSelectedIntent(intent.id)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  intent.id === selectedIntent
                    ? "bg-primary text-on-primary shadow-soft"
                    : "bg-white/75 text-primary hover:-translate-y-0.5"
                }`}
              >
                {intent.label}
              </button>
            ))}
          </div>
        </div>

        <div className="fimy-recommendation bg-white/64 p-5 shadow-soft sm:p-6">
          <div className="mb-6 rounded-[1.5rem] bg-[#f8efdf] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Fimy dice</p>
            <h3 className="mt-2 font-headline text-2xl font-extrabold leading-tight text-on-surface">
              {activeIntent.title}
            </h3>
            <p className="mt-2 leading-7 text-on-surface-variant">{activeIntent.note}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {recommended.map((product) => (
              <article key={product.id} className="guide-product-card group flex h-full flex-col overflow-hidden bg-[#fffaf1] shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lift">
                <Link href={`/producto/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-surface-container">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 250px, 80vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{product.badge ?? "Minifimy"}</p>
                  <h4 className="mt-2 font-headline text-lg font-extrabold leading-tight text-on-surface">
                    <Link href={`/producto/${product.slug}`}>{product.name}</Link>
                  </h4>
                  <p className="mt-2 text-sm font-bold text-secondary">AR$ {product.price.toLocaleString("es-AR")}</p>
                  {productNeedsOptions(product) ? (
                    <Link href={`/producto/${product.slug}`} className="mt-4 inline-flex justify-center rounded-full bg-primary px-4 py-3 text-sm font-bold text-on-primary transition hover:bg-primary-dim">
                      Elegir opciones
                    </Link>
                  ) : (
                    <AddToCartButton product={product} className="mt-4 rounded-full bg-primary px-4 py-3 text-sm font-bold text-on-primary transition hover:bg-primary-dim">
                      Agregar
                    </AddToCartButton>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}