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

  return NextResponse.json({ products: filteredProducts });
}
