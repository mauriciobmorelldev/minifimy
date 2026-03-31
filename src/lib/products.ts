import type { Category, Product } from "@/models/product";

export const categories: Category[] = [
  {
    id: "recien-nacido",
    name: "Recién nacido",
    slug: "recien-nacido",
    description: "Prendas suaves y cómodas para los primeros meses.",
  },
  {
    id: "dormir",
    name: "Sueño tranquilo",
    slug: "dormir",
    description: "Pijamas y mantas para noches cálidas.",
  },
  {
    id: "aventura",
    name: "Mini aventuras",
    slug: "aventura",
    description: "Sets para explorar con libertad.",
  },
  {
    id: "accesorios",
    name: "Accesorios",
    slug: "accesorios",
    description: "Detalles dulces para completar cada look.",
  },
];

export const products: Product[] = [
  {
    id: "body-nube",
    name: "Body Nube Orgánico",
    slug: "body-nube",
    description: "Algodón orgánico con broches suaves y costuras planas.",
    price: 12900,
    images: ["/products/flatlay-01.jpg", "/products/bebe-02.jpg", "/products/bebe-03.jpg"],
    category: "recien-nacido",
    stock: 18,
    badge: "Nuevo",
    sizes: ["0-3M", "3-6M", "6-9M"],
    colors: ["Cielo", "Crema"],
  },
  {
    id: "set-brisa",
    name: "Conjunto Brisa",
    slug: "conjunto-brisa",
    description: "Buzo + jogger liviano para el día a día.",
    price: 24500,
    images: ["/products/bebe-03.jpg", "/products/flatlay-01.jpg", "/products/bebe-04.jpg"],
    category: "aventura",
    stock: 12,
    badge: "Más vendido",
    sizes: ["6-9M", "9-12M", "12-18M"],
    colors: ["Arena", "Salvia"],
  },
  {
    id: "pijama-luna",
    name: "Pijama Luna",
    slug: "pijama-luna",
    description: "Tejido térmico flexible para dormir abrigado.",
    price: 19800,
    images: ["/products/bebe-02.jpg", "/products/bebe-04.jpg", "/products/flatlay-01.jpg"],
    category: "dormir",
    stock: 20,
    badge: "Orgánico",
    sizes: ["3-6M", "6-9M", "9-12M"],
    colors: ["Cielo", "Arcilla"],
  },
  {
    id: "manta-abrazo",
    name: "Manta Abrazo",
    slug: "manta-abrazo",
    description: "Textura plush con borde bordado y extra suavidad.",
    price: 16400,
    images: ["/products/bebe-04.jpg", "/products/bebe-02.jpg", "/products/flatlay-01.jpg"],
    category: "dormir",
    stock: 10,
    badge: "Suave",
  },
  {
    id: "gorro-caricia",
    name: "Gorro Caricia",
    slug: "gorro-caricia",
    description: "Tejido suave, calce cómodo y seguro.",
    price: 7200,
    images: ["/products/bebe-03.jpg", "/products/flatlay-01.jpg", "/products/bebe-02.jpg"],
    category: "accesorios",
    stock: 30,
    badge: "Favorito",
  },
  {
    id: "set-nido",
    name: "Set Nido",
    slug: "set-nido",
    description: "Tres piezas esenciales para salir con estilo.",
    price: 26700,
    images: ["/products/bebe-02.jpg", "/products/bebe-03.jpg", "/products/flatlay-01.jpg"],
    category: "recien-nacido",
    stock: 14,
    badge: "Edición limitada",
    sizes: ["0-3M", "3-6M"],
  },
];

export const getFeaturedProducts = () => products.slice(0, 4);

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);

export const getProductsByCategory = (slug: string) =>
  products.filter((product) => product.category === slug);
