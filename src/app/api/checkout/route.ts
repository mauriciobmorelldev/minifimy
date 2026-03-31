import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

interface CheckoutItem {
  product: { name: string; price: number };
  quantity: number;
}

interface CheckoutPayload {
  items: CheckoutItem[];
  customer?: { email?: string };
}

export async function POST(request: NextRequest) {
  const { items, customer } = (await request.json()) as CheckoutPayload;

  if (!stripe) {
    return NextResponse.json({
      message: "Stripe no configurado. Simulación de checkout exitosa.",
      items,
      customer,
    });
  }

  const lineItems = items.map((item) => ({
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
    customer_email: customer?.email,
  });

  return NextResponse.json({
    message: "Checkout generado",
    sessionId: session.id,
  });
}
