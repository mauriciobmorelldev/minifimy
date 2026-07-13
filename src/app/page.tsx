import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AddToCartButton } from "@/components/AddToCartButton";
import { FimiGiftGuide } from "@/components/FimiGiftGuide";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getFeaturedStoreProducts, getWordPressNewsletterUrl } from "@/lib/woocommerce";
import { productNeedsOptions } from "@/lib/product-options";
import { getHomeContent } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Minifimy acompana primeras veces con ropa de bebe suave, regalos con significado y prendas elegidas con amor.",
};

export default async function HomePage() {
  const newsletterUrl = getWordPressNewsletterUrl();
  const [home, featured] = await Promise.all([getHomeContent(), getFeaturedStoreProducts()]);
  const configuredHero = home.heroFeaturedProductSlug
    ? featured.find((product) => product.slug === home.heroFeaturedProductSlug)
    : undefined;
  const heroProduct = configuredHero ?? featured[0];
  const configuredCompanion = home.heroCompanionProductSlug
    ? featured.find((product) => product.slug === home.heroCompanionProductSlug)
    : undefined;
  const heroCompanion = configuredCompanion ?? featured.find((product) => product.id !== heroProduct?.id) ?? heroProduct;
  const supportProducts = featured.filter((product) => product.id !== heroProduct?.id);

  return (
    <main className="minifimy-story overflow-hidden bg-background pt-20">
      <section className="nursery-hero relative px-5 pb-16 pt-10 sm:px-8 lg:px-10">
        <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <ScrollReveal className="relative z-10 max-w-xl space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/78 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              LO QUE EMPEZÓ COMO UNA IDEA, HOY ES REAL
            </span>
            <div className="space-y-5">
              <h1 className="font-headline text-5xl font-extrabold leading-[0.96] text-on-surface sm:text-6xl lg:text-7xl">
                Mini ropa. Maxi amor.
              </h1>
              <p className="max-w-md text-base leading-8 text-on-surface-variant sm:text-lg">
                Después de meses de imaginar, crear y compartir este camino, MiniFimi ya está acá. Prendas pensadas para acompañar sus primeros momentos.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/catalogo" className="btn-primary gap-2 rounded-full px-7">
                Descubrir MiniFimi
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
              <Link href="/catalogo/seleccion-importada" className="btn-ghost gap-2 rounded-full bg-white/78 px-7">
                Descubrir importados
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={120} className="relative">
            <div className="hero-showcase relative overflow-hidden bg-[#eadfcb]/90 p-5 shadow-lift sm:p-7">
              <Image
                src="/brand/illustrations/nube.svg"
                alt=""
                width={150}
                height={92}
                className="fimy-drift pointer-events-none absolute right-8 top-6 w-28 opacity-45 sm:w-36"
                priority
              />
              <div className="relative grid gap-5 md:grid-cols-[1.02fr_0.98fr]">
                {heroProduct && (
                  <Link href={`/producto/${heroProduct.slug}`} className="hero-feature-card group overflow-hidden bg-white p-3 shadow-soft">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-surface-container">
                      <Image
                        src={heroProduct.images[0]}
                        alt={heroProduct.name}
                        fill
                        sizes="(min-width: 1024px) 430px, 90vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                        priority
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4 px-2 pb-2 pt-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">EL PRIMER FAVORITO DE FIMI</p>
                        <h2 className="mt-1 font-headline text-2xl font-extrabold leading-tight text-on-surface">{heroProduct.name}</h2>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition group-hover:translate-x-1" aria-label="Ver producto">
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </span>
                    </div>
                  </Link>
                )}

                <div className="grid content-between gap-5">
                  <div className="hero-fimy-note bg-white/78 p-5 shadow-soft">
                    <div className="flex items-start gap-4">
                      <Image src="/brand/illustrations/jirafa.svg" alt="Fimy" width={74} height={105} className="fimy-float mt-1 w-14 shrink-0" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">¡Hola! Soy Fimy 💛</p>
                        <p className="mt-2 text-base font-semibold leading-7 text-on-surface-variant">
                          Mirá esta colección especial que elegí para vos.
                        </p>
                        <Link
                          href="/catalogo/seleccion-importada"
                          className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-primary shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
                        >
                          Descubrir importados
                        </Link>
                      </div>
                    </div>
                  </div>

                  {heroCompanion && (
                    <Link href={`/producto/${heroCompanion.slug}`} className="hero-side-product group grid grid-cols-[0.72fr_1fr] gap-4 bg-[#f8efdf] p-4 shadow-soft">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-surface-container">
                        <Image
                          src={heroCompanion.images[0]}
                          alt={heroCompanion.name}
                          fill
                          sizes="(min-width: 1024px) 210px, 45vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">También puede gustarte</p>
                        <h3 className="mt-2 font-headline text-xl font-extrabold leading-tight text-on-surface">{heroCompanion.name}</h3>
                        <p className="mt-2 text-sm font-bold text-secondary">AR$ {heroCompanion.price.toLocaleString("es-AR")}</p>
                      </div>
                    </Link>
                  )}

                  <div className="rounded-full bg-white/72 px-5 py-3 text-sm font-bold text-primary shadow-soft">
                    Para sus primeros días, sus pequeñas aventuras y esos momentos que se quedan para siempre.
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <FimiGiftGuide products={featured} title={home.guideTitle} intro={home.guideIntro} />

      <section className="story-river relative px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal className="space-y-6">
            <span className="chip bg-white/60">{home.editorialKicker}</span>
            <h2 className="max-w-2xl font-headline text-4xl font-extrabold leading-tight text-on-surface sm:text-5xl">
              {home.editorialTitle}
            </h2>
            <div className="space-y-3 pt-2">
              {home.editorialNotes.map((note) => (
                <p key={note} className="border-b border-primary/15 pb-3 text-base leading-7 text-on-surface-variant">
                  {note}
                </p>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal delayMs={120}>
            <div className="editorial-product-row grid gap-4 md:grid-cols-3">
              {supportProducts.slice(0, 3).map((product) => (
                <Link key={product.id} href={`/producto/${product.slug}`} className="editorial-mini-product group overflow-hidden bg-white/82 p-3 shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.2rem]">
                    <Image src={product.images[0]} alt={product.name} fill sizes="260px" className="object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                  <p className="px-1 pt-3 font-headline text-base font-extrabold leading-tight text-on-surface">{product.name}</p>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
        <ScrollReveal className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-xl space-y-3">
            <span className="chip">{home.featuredSectionKicker}</span>
            <h2 className="font-headline text-4xl font-extrabold leading-tight text-on-surface">{home.featuredSectionTitle}</h2>
          </div>
          <Link href="/catalogo" className="inline-flex items-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift md:self-auto">
            Ver todo
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </ScrollReveal>

        {heroProduct && (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <ScrollReveal>
              <article className="product-editorial-card grid min-h-[560px] overflow-hidden bg-[#f0dfc8] shadow-soft md:grid-cols-[0.95fr_1.05fr]">
                <Link href={`/producto/${heroProduct.slug}`} className="relative min-h-[320px] overflow-hidden md:min-h-full">
                  <Image
                    src={heroProduct.images[0]}
                    alt={heroProduct.name}
                    fill
                    sizes="(min-width: 1024px) 42vw, 95vw"
                    className="object-cover transition duration-700 hover:scale-105"
                  />
                </Link>
                <div className="flex flex-col justify-between p-8 sm:p-10">
                  <div className="space-y-5">
                    <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Elegido por Fimy</span>
                    <h3 className="font-headline text-4xl font-extrabold leading-tight text-on-surface">{heroProduct.name}</h3>
                    <p className="max-w-sm text-base leading-8 text-on-surface-variant">{heroProduct.description}</p>
                  </div>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-headline text-2xl font-extrabold text-secondary">AR$ {heroProduct.price.toLocaleString("es-AR")}</p>
                    {productNeedsOptions(heroProduct) ? (
                      <Link href={`/producto/${heroProduct.slug}`} className="rounded-full bg-primary px-7 py-4 text-sm font-bold text-on-primary transition hover:bg-primary-dim">
                        Elegir opciones
                      </Link>
                    ) : (
                      <AddToCartButton product={heroProduct} className="rounded-full bg-primary px-7 py-4 text-sm font-bold text-on-primary transition hover:bg-primary-dim">
                        Agregar al carrito
                      </AddToCartButton>
                    )}
                  </div>
                </div>
              </article>
            </ScrollReveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {supportProducts.slice(0, 3).map((product, index) => (
                <ScrollReveal key={product.id} delayMs={index * 80}>
                  <article className="product-note-card grid grid-cols-[120px_1fr] gap-5 bg-white/72 p-4 shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lift sm:grid-cols-[150px_1fr]">
                    <Link href={`/producto/${product.slug}`} className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-surface-container">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 180px, 35vw"
                        className="object-cover transition duration-700 hover:scale-105"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-col justify-between py-1">
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{product.badge ?? "Minifimy"}</p>
                        <h3 className="font-headline text-xl font-extrabold leading-tight text-on-surface">
                          <Link href={`/producto/${product.slug}`}>{product.name}</Link>
                        </h3>
                      </div>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <p className="font-bold text-secondary">AR$ {product.price.toLocaleString("es-AR")}</p>
                        {productNeedsOptions(product) ? (
                          <Link href={`/producto/${product.slug}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary transition hover:bg-primary-dim" aria-label={`Elegir opciones de ${product.name}`}>
                            <span className="material-symbols-outlined text-lg">tune</span>
                          </Link>
                        ) : (
                          <AddToCartButton product={product} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary transition hover:bg-primary-dim" aria-label={`Agregar ${product.name} al carrito`}>
                            <span className="material-symbols-outlined text-lg">shopping_basket</span>
                          </AddToCartButton>
                        )}
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="pattern-surface px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal className="space-y-5">
            <span className="chip">{home.trustKicker}</span>
            <h2 className="max-w-xl font-headline text-4xl font-extrabold leading-tight text-on-surface">{home.trustTitle}</h2>
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {home.trustItems.map((item, index) => (
              <ScrollReveal key={`${item.title}-${index}`} delayMs={index * 80}>
                <article className="rounded-[1.5rem] bg-white/72 p-6 shadow-soft">
                  <span className="material-symbols-outlined mb-6 text-3xl text-primary">{item.icon}</span>
                  <h3 className="font-headline text-xl font-extrabold">{item.title}</h3>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10">
        <ScrollReveal className="newsletter-cloud overflow-hidden bg-[#d3e0ea] p-8 shadow-soft sm:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <h2 className="font-headline text-3xl font-extrabold text-on-surface">{home.newsletterTitle}</h2>
              <p className="max-w-xl leading-7">{home.newsletterText}</p>
            </div>
            <form action={newsletterUrl ?? "/api/newsletter"} method="post" className="flex w-full flex-col gap-3 sm:w-[420px] sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">Email</label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder="Tu email"
                className="min-h-12 flex-1 rounded-full border border-white/70 bg-white/85 px-5 text-sm text-on-surface outline-none transition focus:border-primary"
              />
              <button type="submit" className="rounded-full bg-secondary px-7 py-3 text-sm font-bold text-on-secondary transition hover:bg-secondary-dim">
                Suscribirme en Fimy
              </button>
            </form>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}