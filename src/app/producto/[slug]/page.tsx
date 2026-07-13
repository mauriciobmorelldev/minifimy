import Link from "next/link";
import type { Metadata } from "next";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductReviews } from "@/components/ProductReviews";
import { getStoreCategories, getStoreProductBySlug, getStoreProductReviews, getStoreProducts } from "@/lib/woocommerce";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const recommendations = allProducts
    .filter((item) => item.id !== product.id && item.category === product.category)
    .concat(allProducts.filter((item) => item.id !== product.id && item.category !== product.category))
    .slice(0, 8);
  const productReviews = await getStoreProductReviews(product.id);

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
        <ProductDetailClient product={product} categoryName={category?.name ?? product.category} />
      </div>

      <ProductReviews productSlug={product.slug} initialReviews={productReviews} />

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
