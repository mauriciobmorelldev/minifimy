import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/products";

export async function GET(
  _: NextRequest,
  { params }: { params?: Promise<{ slug: string }> }
) {
  const { slug } = params ? await params : { slug: "" };
  const product = getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ product });
}
