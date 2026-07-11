import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogExperience } from "@/components/CatalogExperience";
import { getStoreCategories, getStoreProducts } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explorá categorías, regalos y productos de MINIFIMY.",
};

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([
    getStoreProducts({ perPage: 48 }),
    getStoreCategories(),
  ]);

  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fff8ef] pt-28" />}>
      <CatalogExperience products={products} categories={categories} />
    </Suspense>
  );
}
