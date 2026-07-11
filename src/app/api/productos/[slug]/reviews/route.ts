import { NextRequest, NextResponse } from "next/server";
import { createStoreProductReview, getStoreProductBySlug, getStoreProductReviews } from "@/lib/woocommerce";

function isValidEmail(value?: string) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const product = await getStoreProductBySlug(slug);
  if (!product) return NextResponse.json({ message: "Producto no encontrado." }, { status: 404 });

  const reviews = await getStoreProductReviews(product.id);
  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const product = await getStoreProductBySlug(slug);
  if (!product) return NextResponse.json({ message: "Producto no encontrado." }, { status: 404 });

  const payload = await request.json().catch(() => null) as {
    reviewer?: string;
    email?: string;
    review?: string;
    rating?: number;
  } | null;

  const rating = Math.min(Math.max(Number(payload?.rating) || 0, 1), 5);
  if (!payload?.reviewer || !isValidEmail(payload.email) || !payload.review || payload.review.length < 8) {
    return NextResponse.json({ message: "Completa nombre, email y una resena real." }, { status: 400 });
  }

  const review = await createStoreProductReview({
    productId: product.id,
    reviewer: payload.reviewer,
    email: payload.email!,
    review: payload.review,
    rating,
  });

  if (!review) {
    return NextResponse.json({ message: "No pudimos guardar tu resena. Intentemos de nuevo en un ratito." }, { status: 502 });
  }

  return NextResponse.json({ message: "Gracias por tu resena. La vamos a revisar antes de publicarla.", review });
}
