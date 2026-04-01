import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getFeaturedProducts } from "@/lib/products";
import { getHomeContent } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Ropa para bebés diseñada con ternura, textiles orgánicos y el estilo MINIFIMY.",
};

const categoryCards = [
  {
    title: "Recién Nacido",
    subtitle: "Talles 00 a 3 meses",
    href: "/catalogo/recien-nacido",
    image: "/brand/banners/banner-foto.jpg",
  },
  {
    title: "Mini Aventuras",
    subtitle: "Talles 3 a 24 meses",
    href: "/catalogo/aventura",
    image: "/brand/banners/banner-tipografico.jpg",
  },
  {
    title: "Accesorios",
    subtitle: "Complementos con estilo",
    href: "/catalogo/accesorios",
    image: "/brand/illustrations/nube.svg",
    contain: true,
  },
];

export default async function HomePage() {
  const featured = getFeaturedProducts();
  const acf = await getHomeContent();

  const heroImage =
    typeof acf?.hero_banner === "string"
      ? acf.hero_banner
      : acf?.hero_banner?.url ?? "/brand/banners/banner-foto.jpg";
  const heroTitle = acf?.hero_title;
  const heroSubtitle =
    acf?.hero_subtitle ??
    "Acabamos de abrir nuestra tienda de ropa para bebés: prendas orgánicas y suaves.";
  const announcements = Array.isArray(acf?.announcements)
    ? acf.announcements.map((item) => item?.text).filter(Boolean)
    : [
        "Envíos sin cargo en compras superiores a AR$ 25.000",
        "10% off en primera compra con el código MINIFIMY10",
        "Cambios y devoluciones fáciles hasta 30 días",
        "Pagos seguros y cuotas sin interés",
      ];

  return (
    <main className="pt-20">
      <section className="announcement-marquee mx-6 mt-4 rounded-lg bg-primary py-3 text-xs font-semibold uppercase tracking-widest text-on-primary shadow-lg shadow-primary/20">
        <div className="announcement-track">
          <div className="announcement-row">
            {announcements.map((item, index) => (
              <span key={`announce-${index}`}>{item}</span>
            ))}
          </div>
          <div className="announcement-row" aria-hidden="true">
            {announcements.map((item, index) => (
              <span key={`announce-dup-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      </section>
      <section className="relative mx-auto max-w-7xl px-6 pb-12 pt-6 md:pb-20 md:pt-10">
        <ScrollReveal>
          <div className="relative h-[240px] overflow-hidden rounded-xl bg-surface-container-low shadow-2xl sm:h-[280px] md:h-[380px] lg:h-[420px]">
            <Image
              src={heroImage}
              alt="Bebé con prenda orgánica MINIFIMY"
              fill
              sizes="(min-width: 1280px) 1200px, (min-width: 1024px) 90vw, 100vw"
              className="object-contain sm:object-cover sm:object-[center_35%]"
              quality={90}
              priority
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={120} className="mt-10 space-y-6 md:mt-14">
          <span className="inline-block rounded-full bg-primary-container px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-primary-container">
            Nuevo lanzamiento
          </span>
          <h1 className="max-w-3xl font-headline text-4xl font-bold leading-[1.1] text-on-surface md:text-6xl">
            {heroTitle ? (
              heroTitle
            ) : (
              <>
                Bienvenidos a <span className="text-primary italic">MINIFIMY</span>
              </>
            )}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            {heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/catalogo"
              className="rounded-md bg-primary px-8 py-4 font-bold text-on-primary shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-105"
            >
              Comprar ahora
            </Link>
            <Link
              href="/catalogo"
              className="rounded-md bg-secondary-container px-8 py-4 font-bold text-on-secondary-container transition-colors hover:bg-secondary-fixed"
            >
              Ver catálogo
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <section className="pattern-surface mx-auto max-w-7xl px-6 py-20">
        <ScrollReveal className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="font-headline text-3xl font-bold text-on-surface md:text-4xl">
              Explora por etapas
            </h2>
            <p className="mt-2 text-on-surface-variant">Creciendo con ellos en cada paso.</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {categoryCards.map((card, index) => (
            <ScrollReveal key={card.title} delayMs={index * 90}>
              <Link
                href={card.href}
                className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-lg bg-surface-container-low p-8 transition-all duration-500 hover:shadow-xl"
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(min-width: 768px) 30vw, 90vw"
                  className={
                    card.contain
                      ? "object-contain p-10 opacity-70 transition-transform duration-700 group-hover:scale-105"
                      : "object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest/80 via-transparent to-transparent" />
                <div className="relative z-10">
                  <h3 className="mb-2 font-headline text-2xl font-bold text-on-surface">
                    {card.title}
                  </h3>
                  <p className="mb-4 text-sm text-on-surface-variant">{card.subtitle}</p>
                  <span className="inline-flex items-center gap-2 text-primary font-bold">
                    Ver más{" "}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="pattern-surface mx-auto max-w-7xl px-6 py-24">
        <ScrollReveal className="mb-16 text-center">
          <h2 className="font-headline text-4xl font-bold text-on-surface">Nuestros favoritos</h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-secondary" />
        </ScrollReveal>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {featured.map((product, index) => (
            <ScrollReveal key={product.id} delayMs={index * 80}>
              <div className="group">
                <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-surface-container-low">
                  <div className="pointer-events-none absolute inset-0 opacity-20">
                    <Image
                      src="/brand/frames/marco-dots.png"
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 45vw"
                      className="object-cover"
                    />
                  </div>
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 45vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Link
                    href={`/producto/${product.slug}`}
                    className="absolute bottom-4 right-4 rounded-md bg-white/90 p-3 text-primary opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                    aria-label={`Ver ${product.name}`}
                  >
                    <span className="material-symbols-outlined">add_shopping_cart</span>
                  </Link>
                </div>
                <h4 className="font-headline font-bold text-on-surface">{product.name}</h4>
                <p className="mt-1 font-bold text-secondary">
                  AR$ {product.price.toLocaleString("es-AR")}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="pattern-surface relative mx-6 overflow-hidden rounded-lg bg-surface-container py-24">
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <Image
            src="/brand/illustrations/jirafa.svg"
            alt="Patrón decorativo"
            fill
            sizes="100vw"
            className="object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <ScrollReveal className="mb-12 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white p-4 shadow-sm">
              <Image src="/brand/logo.svg" alt="Logo minifimy" width={64} height={64} />
            </div>
          </ScrollReveal>
          <ScrollReveal delayMs={100}>
            <h2 className="mb-12 font-headline text-4xl font-bold text-on-surface">
              Por qué elegir minifimy
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                icon: "eco",
                title: "Sustentabilidad",
                text: "Procesos éticos y materiales de bajo impacto ambiental.",
              },
              {
                icon: "temp_preferences_eco",
                title: "Algodón orgánico",
                text: "Libre de químicos, ideal para la piel más sensible.",
              },
              {
                icon: "favorite",
                title: "Hecho con amor",
                text: "Atención meticulosa a cada costura y detalle.",
              },
            ].map((item, index) => (
              <ScrollReveal key={item.title} delayMs={index * 120}>
                <div className="flex flex-col items-center">
                  <span
                    className="material-symbols-outlined mb-4 text-4xl text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                  <h4 className="mb-2 font-headline font-bold">{item.title}</h4>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    {item.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
