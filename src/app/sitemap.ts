import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://minifimy.com";

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/catalogo`, lastModified: new Date() },
    { url: `${baseUrl}/carrito`, lastModified: new Date() },
    { url: `${baseUrl}/checkout`, lastModified: new Date() },
    { url: `${baseUrl}/cuenta`, lastModified: new Date() },
    { url: `${baseUrl}/contacto`, lastModified: new Date() },
    ...categories.map((category) => ({
      url: `${baseUrl}/catalogo/${category.slug}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/producto/${product.slug}`,
      lastModified: new Date(),
    })),
  ];
}
