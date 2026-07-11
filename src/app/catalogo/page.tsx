import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogExperience } from "@/components/CatalogExperience";
import { getStoreProductFilters, getStoreProducts } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explorá categorías, regalos y productos de MINIFIMY.",
};

export default async function CatalogPage() {
  const [products, filterOptions] = await Promise.all([
    getStoreProducts({ perPage: 48 }),
    getStoreProductFilters(),
  ]);

  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fff8ef] pt-28" />}>
      <CatalogExperience products={products} categories={filterOptions.categories} filterOptions={filterOptions} />
    </Suspense>
  );
}
