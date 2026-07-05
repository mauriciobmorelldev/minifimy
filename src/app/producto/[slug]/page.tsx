import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AddToCartButton } from "@/components/AddToCartButton";
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
          Volver al catalogo
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
    <main className="mx-auto max-w-7xl px-6 pb-12 pt-24">
      <nav className="mb-8 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant/60">
        <Link href="/" className="transition-colors hover:text-primary">
          Inicio
        </Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <Link
          href={`/catalogo/${product.category}`}
          className="transition-colors hover:text-primary"
        >
          {category?.name ?? "Categoria"}
        </Link>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="text-on-surface">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <ScrollReveal className="space-y-6 lg:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low">
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
          <div className="grid grid-cols-3 gap-6">
            {gallery.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="aspect-square overflow-hidden rounded-lg bg-surface-container-low"
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
            <h1 className="font-headline text-4xl font-bold leading-tight text-on-surface">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="font-headline text-3xl font-semibold text-secondary">
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
                    className={`rounded-md border-2 px-6 py-3 font-medium transition-all ${
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
              className="w-full gap-3 rounded-md bg-primary py-5 font-headline text-lg text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              Agregar al bolso
            </AddToCartButton>
          </div>

          <div className="space-y-4 rounded-xl bg-surface-container-low p-6">
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

      <section className="mt-24 space-y-12">
        <ScrollReveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-headline text-3xl font-bold">Completa el look</h2>
            <p className="mt-2 text-on-surface-variant">
              Combos suaves para cada momento.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="flex items-center gap-2 font-bold text-primary transition-all hover:gap-4"
          >
            Ver coleccion completa
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((item, index) => (
            <ScrollReveal key={item.id} delayMs={index * 80}>
              <Link href={`/producto/${item.slug}`} className="group">
                <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-surface-container-low">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 80vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h4 className="font-bold text-on-surface">{item.name}</h4>
                <p className="font-semibold text-secondary">
                  AR$ {item.price.toLocaleString("es-AR")}
                </p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </main>
  );
}