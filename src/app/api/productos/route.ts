import { NextRequest, NextResponse } from "next/server";
import { getStoreProducts } from "@/lib/woocommerce";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = normalize(searchParams.get("q")?.trim() ?? "");
  const category = searchParams.get("categoria")?.trim();
  const requestedLimit = Number(searchParams.get("limit") ?? 0);
  const suggestionsOnly = searchParams.get("suggestions") === "1";
  const recommendations = searchParams.get("recommendations") === "1";
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.trunc(requestedLimit), 0), 12) : 0;
  const products = await getStoreProducts({ perPage: 100 });

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !category || category === "all" || product.category === category;
    const haystack = normalize([
      product.name,
      product.description,
      product.category,
      product.badge,
      ...(product.sizes ?? []),
      ...(product.colors ?? []),
    ].filter(Boolean).join(" "));

    return matchesCategory && (!query || haystack.includes(query));
  });

  const availableProducts = recommendations
    ? filteredProducts.filter((product) => product.stockStatus !== "outofstock" && product.stock !== 0)
    : filteredProducts;
  const limitedProducts = limit ? availableProducts.slice(0, limit) : availableProducts;

  if (suggestionsOnly) {
    return NextResponse.json({
      products: limitedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] ?? "/brand/illustrations/jirafa.svg",
        category: product.category,
        price: product.price,
        prices: product.prices,
      })),
    });
  }

  return NextResponse.json({ products: limitedProducts });
}
