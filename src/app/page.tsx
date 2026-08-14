import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BenefitsBar } from "@/components/BenefitsBar";
import { HomeHeroCarousel } from "@/components/HomeHeroCarousel";
import { HomeOpportunities } from "@/components/HomeOpportunities";
import { NewArrivalsCarousel } from "@/components/NewArrivalsCarousel";
import { ProductPrice } from "@/components/ProductPrice";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getFeaturedStoreProducts, getNewestStoreProducts, getStoreProductFilters, getStoreProductsByCategory, getWordPressNewsletterUrl } from "@/lib/woocommerce";
import { productNeedsOptions } from "@/lib/product-options";
import { productIsInStock } from "@/lib/product-stock";
import { getHomeContent } from "@/lib/wordpress";

function pickProductsBySlugs(products: Awaited<ReturnType<typeof getFeaturedStoreProducts>>, slugs: string[], fallback: typeof products) {
  const picked = slugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is (typeof products)[number] => Boolean(product));

  return picked.length > 0 ? picked : fallback;
}

function pickProductsByTags(products: Awaited<ReturnType<typeof getFeaturedStoreProducts>>, tags: string[], fallback: typeof products) {
  const picked = products.filter((product) => product.tagSlugs?.some((tag) => tags.includes(tag)));

  return picked.length > 0 ? picked : fallback;
}

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "MiniFimy acompaña primeras veces con ropa de bebé suave, regalos con significado y prendas elegidas con amor.",
};

export default async function HomePage() {
  const newsletterUrl = getWordPressNewsletterUrl();
  const [home, featured, newestProducts, filterOptions, opportunityProducts] = await Promise.all([
    getHomeContent(),
    getFeaturedStoreProducts(),
    getNewestStoreProducts(15),
    getStoreProductFilters(),
    getStoreProductsByCategory("ultimas-oportunidades"),
  ]);
  const inStockOpportunityProducts = opportunityProducts.filter(productIsInStock).slice(0, 8);
  const taggedHero = pickProductsByTags(featured, ["home-fimy"], [])[0];
  const configuredHero = home.heroFeaturedProductSlug
    ? featured.find((product) => product.slug === home.heroFeaturedProductSlug)
    : undefined;
  const heroProduct = configuredHero ?? taggedHero ?? featured[0];
  const featuredProductsBySlug = pickProductsBySlugs(featured, home.featuredProductSlugs, []);
  const featuredSectionProducts = pickProductsByTags(featured, ["home-destacados"], featuredProductsBySlug.length > 0 ? featuredProductsBySlug : featured);
  const sectionHeroProduct = featuredSectionProducts[0] ?? heroProduct;
  const sectionSupportProducts = featuredSectionProducts.filter((product) => product.id !== sectionHeroProduct?.id);
  const homeFilterLinks = [
    ...filterOptions.categories.slice(0, 3).map((category) => ({
      label: category.name,
      href: `/catalogo/${category.slug}`,
      icon: "category",
    })),
    ...filterOptions.sizes.slice(0, 3).map((size) => ({
      label: `Talle ${size}`,
      href: `/catalogo?talle=${encodeURIComponent(size)}`,
      icon: "straighten",
    })),
  ].slice(0, 6);

  return (
    <main className="minifimy-story overflow-hidden bg-background pt-20">
      <BenefitsBar />

      <HomeHeroCarousel />

      <HomeOpportunities products={inStockOpportunityProducts} />

      <section aria-labelledby="shop-by-need" className="mx-auto max-w-7xl px-5 pb-8 sm:px-8 lg:px-10">
        <ScrollReveal>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <span className="chip">Empezá por acá</span>
              <h2 id="shop-by-need" className="mt-3 font-headline text-3xl font-extrabold sm:text-4xl">
                Comprá por talle o necesidad
              </h2>
            </div>
            <Link href="/catalogo" className="hidden text-sm font-bold text-secondary underline underline-offset-4 sm:inline-flex">
              Ver catálogo completo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {homeFilterLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="group flex min-h-32 flex-col justify-between rounded-[1.5rem] bg-white/78 p-4 shadow-soft ring-1 ring-primary/10 transition hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="material-symbols-outlined text-2xl text-primary transition group-hover:-rotate-6">{link.icon}</span>
                <span className="font-headline text-base font-extrabold leading-tight text-on-surface">{link.label}</span>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <NewArrivalsCarousel products={newestProducts} />

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

        {sectionHeroProduct && (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <ScrollReveal>
              <article className="product-editorial-card grid min-h-[560px] overflow-hidden bg-[#f0dfc8] shadow-soft md:grid-cols-[0.95fr_1.05fr]">
                <Link href={`/producto/${sectionHeroProduct.slug}`} className="relative min-h-[320px] overflow-hidden md:min-h-full">
                  <Image
                    src={sectionHeroProduct.images[0]}
                    alt={sectionHeroProduct.name}
                    fill
                    sizes="(min-width: 1024px) 42vw, 95vw"
                    className="object-cover transition duration-700 hover:scale-105"
                  />
                </Link>
                <div className="flex flex-col justify-between p-8 sm:p-10">
                  <div className="space-y-5">
                    <span className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Elegido por Fimy</span>
                    <h3 className="font-headline text-4xl font-extrabold leading-tight text-on-surface">{sectionHeroProduct.name}</h3>
                    <p className="max-w-sm text-base leading-8 text-on-surface-variant">{sectionHeroProduct.description}</p>
                  </div>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <ProductPrice price={sectionHeroProduct.price} prices={sectionHeroProduct.prices} compact className="text-left" />
                    {productNeedsOptions(sectionHeroProduct) ? (
                      <Link href={`/producto/${sectionHeroProduct.slug}`} className="rounded-full bg-primary px-7 py-4 text-sm font-bold text-on-primary transition hover:bg-primary-dim">
                        Elegir opciones
                      </Link>
                    ) : (
                      <AddToCartButton product={sectionHeroProduct} className="rounded-full bg-primary px-7 py-4 text-sm font-bold text-on-primary transition hover:bg-primary-dim">
                        Agregar al carrito
                      </AddToCartButton>
                    )}
                  </div>
                </div>
              </article>
            </ScrollReveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {sectionSupportProducts.slice(0, 3).map((product, index) => (
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
                        <h3 className="font-headline text-xl font-extrabold leading-tight text-on-surface">
                          <Link href={`/producto/${product.slug}`}>{product.name}</Link>
                        </h3>
                      </div>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <ProductPrice price={product.price} prices={product.prices} compact className="text-left" />
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

      <section className="story-river relative px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.88fr_1.12fr]">
          <ScrollReveal className="space-y-6">
            <span className="chip bg-white/70">Nuestra historia</span>
            <h2 className="max-w-2xl font-headline text-4xl font-extrabold leading-tight text-on-surface sm:text-5xl">
              Somos Sofi y May, dos tías babosas detrás de MiniFimy.
            </h2>
            <div className="space-y-4 pt-2 text-base leading-8 text-on-surface-variant sm:text-lg">
              <p>
                Una idea que nació entre sobrinos, ropitas diminutas y mucho amor por cada detalle. Después de muchos años soñándolo, hoy MiniFimy finalmente es una realidad.
              </p>
              <p className="rounded-[1.4rem] bg-white/68 p-5 font-headline text-xl font-extrabold leading-8 text-primary shadow-soft">
                De dos tías babosas, para todos esos pequeños momentos que se guardan para siempre.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delayMs={120}>
            <div className="relative mx-auto max-w-xl">
              <div className="absolute -left-5 top-8 hidden h-28 w-28 rounded-full bg-[#d8e0c3] opacity-70 blur-2xl sm:block" />
              <div className="absolute -right-4 bottom-10 h-32 w-32 rounded-full bg-[#f1cdbd] opacity-60 blur-2xl" />
              <figure className="relative overflow-hidden rounded-[2.2rem] bg-white p-3 shadow-lift ring-1 ring-primary/10">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.7rem] bg-surface-container sm:aspect-[5/6]">
                  <Image
                    src="/brand/story/sofi-may.jpeg"
                    alt="Sofi y May, creadoras de MiniFimy"
                    fill
                    sizes="(min-width: 1024px) 520px, 92vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-4 px-3 py-4 text-sm font-bold text-primary">
                  <span>Sofi & May</span>
                  <span className="rounded-full bg-[#f7efe3] px-3 py-1 text-xs uppercase tracking-[0.18em]">Mini ropa, maxi amor</span>
                </figcaption>
              </figure>
            </div>
          </ScrollReveal>
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
