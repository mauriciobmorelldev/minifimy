import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ScrollReveal } from "@/components/ScrollReveal";
import { categories, getProductBySlug, products } from "@/lib/products";

interface ProductPageProps {
  params: { slug: string };
}

export const revalidate = 90;

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = getProductBySlug(params.slug);
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

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);

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
  const recommendations = products.filter((item) => item.id !== product.id).slice(0, 4);

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
          {category?.name ?? "Categoría"}
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
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  eco
                </span>
                100% ORGÁNICO
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
            <h1 className="text-4xl font-bold leading-tight text-on-surface font-headline">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-3xl font-semibold text-secondary font-headline">
                AR$ {product.price.toLocaleString("es-AR")}
              </span>
              <div className="flex items-center gap-1">
                <div className="flex text-secondary">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="text-xs font-medium text-on-surface-variant">(128 reseñas)</span>
              </div>
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
                        ? "border-primary bg-primary-container text-on-primary-container font-bold"
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
              className="w-full gap-3 rounded-md bg-primary py-5 text-lg font-headline text-on-primary shadow-lg shadow-primary/20 transition-all hover:brightness-110 active:scale-95"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              Agregar al bolso
            </AddToCartButton>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-md bg-secondary-container py-4 font-bold text-on-secondary-container transition-all hover:brightness-105"
            >
              <span className="material-symbols-outlined">favorite</span>
              Guardar en favoritos
            </button>
          </div>

          <div className="space-y-4 rounded-xl bg-surface-container-low p-6">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              <div>
                <h4 className="text-sm font-bold">Envío suave sin cargo</h4>
                <p className="text-sm text-on-surface-variant">
                  Llega en packaging reciclado dentro de 3-5 días.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 border-t border-outline-variant/10 pt-4">
              <span className="material-symbols-outlined text-primary">verified_user</span>
              <div>
                <h4 className="text-sm font-bold">Garantía MINIFIMY</h4>
                <p className="text-sm text-on-surface-variant">
                  30 días para cambios con tranquilidad.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold font-headline">La historia detrás</h3>
            <p className="leading-relaxed text-on-surface-variant">
              {product.description} Cada prenda está pensada para abrazar la piel del bebé
              con fibras suaves, costuras planas y terminaciones seguras que acompañan el
              movimiento.
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-medium">
              {[
                "100% Algodón orgánico",
                "Broches sin níquel",
                "Puños suaves",
                "Sin etiquetas internas",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">
                    check_circle
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </div>

      <section className="mt-24 overflow-hidden rounded-xl bg-tertiary-container/30 p-12">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <ScrollReveal className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-tertiary">
              <span className="material-symbols-outlined text-sm">wash</span>
              Guía de cuidado
            </div>
            <h2 className="text-3xl font-headline font-bold text-on-surface">
              Mantén la suavidad intacta
            </h2>
            <p className="max-w-md text-on-surface-variant">
              Nuestros tejidos orgánicos son fibras vivas. Para conservar su tacto gentil
              en cada aventura, seguí estos pasos.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-bold text-primary">Lavado frío</h4>
                <p className="text-xs text-on-surface-variant">
                  Usá detergente suave a 30°C para preservar las fibras.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-primary">Secado al aire</h4>
                <p className="text-xs text-on-surface-variant">
                  Evitá el secarropas y colgá a la sombra para mejores resultados.
                </p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delayMs={120} className="relative">
            <Image
              src={product.images[1] ?? product.images[0]}
              alt="Cuidado de prendas para bebé"
              width={640}
              height={420}
              className="aspect-video rounded-lg object-cover shadow-xl"
            />
            <div className="absolute -bottom-6 -right-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary p-4 text-center text-[10px] font-bold uppercase tracking-tighter text-on-primary shadow-lg">
              Amado por la naturaleza
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="mt-24 space-y-12">
        <ScrollReveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-headline font-bold">Completa el look</h2>
            <p className="mt-2 text-on-surface-variant">
              Combos suaves y orgánicos para cada momento.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="flex items-center gap-2 font-bold text-primary transition-all hover:gap-4"
          >
            Ver colección completa
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
                  <div className="pointer-events-none absolute inset-0 opacity-20">
                    <Image
                      src="/brand/frames/marco-dots.png"
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 80vw"
                      className="object-cover"
                    />
                  </div>
                  <span className="absolute bottom-4 right-4 rounded-md bg-surface px-2 py-1 text-primary shadow-md opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="material-symbols-outlined">add</span>
                  </span>
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
