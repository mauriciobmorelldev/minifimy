import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getStoreCategories, getStoreProductBySlug, getStoreProducts } from "@/lib/woocommerce";

interface ProductPageProps {
  params: { slug: string };
}

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getStoreProducts({ perPage: 100 });
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getStoreProductBySlug(params.slug);
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
  const [product, categories, allProducts] = await Promise.all([
    getStoreProductBySlug(params.slug),
    getStoreCategories(),
    getStoreProducts({ perPage: 100 }),
  ]);

  if (!product) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-24">
        <p className="text-sm text-on-surface-variant">Producto no encontrado.</p>
        <Link href="/catalogo" className="btn-ghost mt-6 inline-flex">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  const category = categories.find((item) => item.slug === product.category);
  const gallery = product.images.length >= 3
    ? product.images
    : [product.images[0], product.images[0], product.images[0]];
  const recommendations = allProducts.filter((item) => item.id !== product.id).slice(0, 4);

  return (
    <main className="mobile-soft-page mx-auto max-w-7xl px-4 pb-12 pt-24 md:px-6">
      <nav className="mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60 md:mb-8 md:text-xs">
        <Link href="/" className="transition-colors hover:text-primary">
          Inicio
        </Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <Link
          href={`/catalogo/${product.category}`}
          className="transition-colors hover:text-primary"
        >
          {category?.name ?? "Categoría"}
        </Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="text-on-surface">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <ScrollReveal className="space-y-6 lg:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-surface-container-low md:rounded-xl">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 55vw, 90vw"
              className="object-cover"
            />
            <div className="absolute left-6 top-6 rounded-full bg-surface/90 px-4 py-2 shadow-sm backdrop-blur">
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
                className="aspect-square overflow-hidden rounded-[1.1rem] bg-surface-container-low md:rounded-lg"
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

        <ScrollReveal delayMs={120} className="space-y-8 lg:col-span-5">
          <header>
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

          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-4">
              <label className="block text-sm font-bold uppercase tracking-widest text-on-surface">
                Selecciona talle
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size, index) => (
                  <button
                    key={size}
                    type="button"
                    className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all md:px-6 md:py-3 md:text-base ${
                      index === 0
                        ? "border-primary bg-primary-container font-bold text-on-primary-container"
                        : "border-outline-variant/30 text-on-surface hover:border-primary hover:text-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <AddToCartButton
              product={product}
              className="w-full gap-3 rounded-full bg-primary py-4 font-headline text-base text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95 md:py-5 md:text-lg"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              Agregar al bolso
            </AddToCartButton>
          </div>

          <div className="space-y-4 rounded-[1.5rem] bg-surface-container-low p-5 md:rounded-xl md:p-6">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              <div>
                <h4 className="text-sm font-bold">Envío cuidado</h4>
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
                  Acompañamiento para elegir talle o cambiar con tranquilidad.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-headline text-xl font-bold">La historia detrás</h3>
            <p className="leading-relaxed text-on-surface-variant">
              {product.description}
            </p>
          </div>
        </ScrollReveal>
      </div>

      <div className="mt-14 md:mt-24">
        <ProductCarousel
          title="Completá el look"
          eyebrow="Productos relacionados"
          description="Combos suaves para cada momento, listos para sumar a la bolsita."
          products={recommendations}
          ctaLabel="Ver colección"
        />
      </div>
    </main>
  );
}
