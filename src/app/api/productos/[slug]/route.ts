import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/products";

interface Params {
  params: { slug: string };
}

export async function GET(_: Request, { params }: Params) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ product });
}
