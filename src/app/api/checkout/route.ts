import { NextRequest, NextResponse } from "next/server";
import { getStoreProducts } from "@/lib/woocommerce";
import { stripe } from "@/lib/stripe";

interface CheckoutItem {
  product?: { id?: string; name?: string; price?: number };
  quantity?: number;
}

interface CheckoutPayload {
  items?: CheckoutItem[];
  customer?: { email?: string };
}

const MAX_CHECKOUT_ITEMS = 20;
const MAX_QUANTITY_PER_ITEM = 10;

function isValidEmail(value?: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as CheckoutPayload | null;

  if (!payload?.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ message: "Carrito inválido." }, { status: 400 });
  }

  if (payload.items.length > MAX_CHECKOUT_ITEMS) {
    return NextResponse.json({ message: "Demasiados productos en el carrito." }, { status: 400 });
  }

  if (!isValidEmail(payload.customer?.email)) {
    return NextResponse.json({ message: "Email inválido." }, { status: 400 });
  }

  const storeProducts = await getStoreProducts({ perPage: 100 });
  const storeProductsById = new Map(storeProducts.map((product) => [product.id, product]));

  const safeItems = payload.items.map((item) => {
    const productId = item.product?.id;
    const product = productId ? storeProductsById.get(productId) : null;
    const quantity = Math.min(Math.max(Number(item.quantity) || 1, 1), MAX_QUANTITY_PER_ITEM);
    return product ? { product, quantity } : null;
  }).filter(Boolean) as { product: (typeof storeProducts)[number]; quantity: number }[];

  if (safeItems.length === 0) {
    return NextResponse.json({ message: "No encontramos productos válidos para cobrar." }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json({
      message: "Stripe no configurado. Simulación de checkout exitosa.",
      items: safeItems,
      customer: payload.customer,
    });
  }

  const lineItems = safeItems.map((item) => ({
    price_data: {
      currency: "ars",
      product_data: {
        name: item.product.name,
      },
      unit_amount: Math.round(item.product.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://minifimy.com"}/gracias`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://minifimy.com"}/carrito`,
    customer_email: payload.customer?.email,
  });

  return NextResponse.json({
    message: "Checkout generado",
    sessionId: session.id,
  });
}
