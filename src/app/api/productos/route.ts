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

  return NextResponse.json({ products: limit ? filteredProducts.slice(0, limit) : filteredProducts });
}
