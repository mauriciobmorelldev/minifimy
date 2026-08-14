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
    { url: `${baseUrl}/legales`, lastModified: new Date() },
    { url: `${baseUrl}/privacidad`, lastModified: new Date() },
    { url: `${baseUrl}/cookies`, lastModified: new Date() },
    ...categories.filter((category) => category.slug !== "sin-categorizar").map((category) => ({
      url: `${baseUrl}/catalogo/${category.slug}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/producto/${product.slug}`,
      lastModified: new Date(),
    })),
  ];
}
