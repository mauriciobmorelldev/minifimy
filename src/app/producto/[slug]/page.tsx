import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getStoreCategories, getStoreProductBySlug, getStoreProducts } from "@/lib/woocommerce";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const reviews = [
  ["Sofia", "La tela es hermosa y llego con una presentacion divina."],
  ["Mica", "Compre para regalar y quedo super delicado. Todo muy cuidado."],
  ["Valen", "El talle fue tal cual y la prenda se siente muy suave."],
];

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getStoreProducts({ perPage: 100 });
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);
  return {
    title: product ? product.name : "Producto",
    description: product?.description ?? "Detalle de producto MINIFIMY.",
    openGraph: product
      ? {
          title: product.name,
          description: product.description,
          images: [{ url: product.images[0] }],
        }
      : undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, categories, allProducts] = await Promise.all([
    getStoreProductBySlug(slug),
    getStoreCategories(),
    getStoreProducts({ perPage: 100 }),
  ]);

  if (!product) {
    return (
      <main className="mobile-soft-page mx-auto w-full max-w-6xl px-4 py-28 md:px-6">
        <div className="rounded-[2rem] bg-white/80 p-8 text-center shadow-soft">
          <p className="text-sm text-on-surface-variant">Producto no encontrado o todavia no publicado.</p>
          <Link href="/catalogo" className="btn-ghost mt-6 inline-flex">
            Volver al catalogo
          </Link>
        </div>
      </main>
    );
  }

  const category = categories.find((item) => item.slug === product.category);
  const gallery = product.images.length >= 3
    ? product.images
    : [product.images[0], product.images[0], product.images[0]];
  const recommendations = allProducts
    .filter((item) => item.id !== product.id && item.category === product.category)
    .concat(allProducts.filter((item) => item.id !== product.id && item.category !== product.category))
    .slice(0, 8);

  return (
    <main className="mobile-soft-page mx-auto max-w-7xl px-4 pb-12 pt-24 md:px-6">
      <nav className="mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap rounded-full bg-white/64 px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/70 shadow-soft md:mb-8 md:text-xs" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-primary">
          Inicio
        </Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <Link href="/catalogo" className="transition-colors hover:text-primary">
          Catalogo
        </Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <Link href={`/catalogo/${product.category}`} className="transition-colors hover:text-primary">
          {category?.name ?? "Categoria"}
        </Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="text-on-surface">{product.name}</span>
      </nav>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/catalogo" className="inline-flex items-center gap-2 rounded-full bg-white/78 px-4 py-2 text-sm font-bold text-primary shadow-soft transition hover:bg-white">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Volver al catalogo
        </Link>
        <Link href="/carrito" className="inline-flex items-center gap-2 rounded-full bg-[#f7efe3] px-4 py-2 text-sm font-bold text-secondary shadow-soft">
          Ver carrito
          <span className="material-symbols-outlined text-lg">shopping_basket</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <ScrollReveal className="space-y-6 lg:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-surface-container-low md:rounded-[2rem]">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 55vw, 90vw"
              className="object-cover"
              priority
            />
            <div className="absolute left-5 top-5 rounded-full bg-surface/90 px-4 py-2 shadow-sm backdrop-blur md:left-6 md:top-6">
              <span className="flex items-center gap-2 text-xs font-bold text-primary">
                <span className="material-symbols-outlined text-sm">eco</span>
                MINIFIMY
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {gallery.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="aspect-square overflow-hidden rounded-[1.1rem] bg-surface-container-low md:rounded-[1.4rem]"
              >
                <Image
                  src={image}
                  alt={`${product.name} vista ${index + 1}`}
                  width={220}
                  height={220}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={120} className="space-y-7 lg:col-span-5">
          <header>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{category?.name ?? product.category}</p>
            <h1 className="font-headline text-[2.15rem] font-bold leading-tight text-on-surface md:text-4xl">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="font-headline text-2xl font-semibold text-secondary md:text-3xl">
                AR$ {product.price.toLocaleString("es-AR")}
              </span>
              <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container">
                Stock {product.stock > 0 ? "disponible" : "a consultar"}
              </span>
            </div>
          </header>

          <ProductPurchasePanel product={product} />

          <div className="space-y-4 rounded-[1.5rem] bg-surface-container-low p-5 md:p-6">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              <div>
                <h4 className="text-sm font-bold">Envio cuidado</h4>
                <p className="text-sm text-on-surface-variant">
                  Preparado en packaging Minifimy y despachado con seguimiento.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 border-t border-outline-variant/10 pt-4">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              <div>
                <h4 className="text-sm font-bold">Cambios simples</h4>
                <p className="text-sm text-on-surface-variant">
                  Acompanamiento para elegir talle o cambiar con tranquilidad.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-headline text-xl font-bold">La historia detras</h3>
            <p className="leading-relaxed text-on-surface-variant">
              {product.description}
            </p>
          </div>
        </ScrollReveal>
      </div>

      <section className="mt-14 rounded-[2rem] bg-white/72 p-5 shadow-soft md:mt-20 md:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Resenas</span>
            <h2 className="mt-2 font-headline text-2xl font-extrabold text-on-surface md:text-3xl">
              Familias que ya eligieron Minifimy
            </h2>
          </div>
          <div className="rounded-full bg-[#f7efe3] px-4 py-2 text-sm font-bold text-secondary">
            4.9 / 5
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map(([name, text]) => (
            <article key={name} className="rounded-[1.5rem] bg-[#fbf4ea] p-5">
              <div className="mb-3 flex text-secondary" aria-label="5 estrellas">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
              </div>
              <p className="text-sm leading-6 text-on-surface-variant">“{text}”</p>
              <p className="mt-4 text-sm font-bold text-on-surface">{name}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-14 md:mt-24">
        <ProductCarousel
          title="Completa el look"
          eyebrow="Productos relacionados"
          description="Combos suaves para cada momento, listos para sumar a la bolsita."
          products={recommendations}
          ctaLabel="Ver coleccion"
        />
      </div>
    </main>
  );
}
