import { NextRequest, NextResponse } from "next/server";
import { getStoreProducts } from "@/lib/woocommerce";

interface CheckoutItem {
  product?: { id?: string; name?: string; price?: number };
  quantity?: number;
}

interface CheckoutPayload {
  items?: CheckoutItem[];
  customer?: { email?: string; name?: string; phone?: string; address?: string; city?: string; postalCode?: string };
}

const MAX_CHECKOUT_ITEMS = 20;
const MAX_QUANTITY_PER_ITEM = 10;
const SHIPPING_PRICE = 950;
const MERCADO_PAGO_API = "https://api.mercadopago.com/checkout/preferences";

function isValidEmail(value?: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://minifimy.com";
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as CheckoutPayload | null;

  if (!payload?.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ message: "Carrito invalido." }, { status: 400 });
  }

  if (payload.items.length > MAX_CHECKOUT_ITEMS) {
    return NextResponse.json({ message: "Demasiados productos en el carrito." }, { status: 400 });
  }

  if (!isValidEmail(payload.customer?.email)) {
    return NextResponse.json({ message: "Email invalido." }, { status: 400 });
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
    return NextResponse.json({ message: "No encontramos productos validos para cobrar." }, { status: 400 });
  }

  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    return NextResponse.json({
      message: "Mercado Pago no configurado. Simulacion de checkout exitosa.",
      items: safeItems,
      customer: payload.customer,
    });
  }

  const siteUrl = getSiteUrl();
  const preferenceResponse = await fetch(MERCADO_PAGO_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        ...safeItems.map((item) => ({
          id: item.product.id,
          title: item.product.name,
          quantity: item.quantity,
          currency_id: "ARS",
          unit_price: item.product.price,
        })),
        {
          id: "shipping",
          title: "Envio estimado",
          quantity: 1,
          currency_id: "ARS",
          unit_price: SHIPPING_PRICE,
        },
      ],
      payer: {
        name: payload.customer?.name,
        email: payload.customer?.email,
        phone: payload.customer?.phone ? { number: payload.customer.phone } : undefined,
        address: payload.customer?.address
          ? {
              street_name: payload.customer.address,
              zip_code: payload.customer.postalCode,
            }
          : undefined,
      },
      back_urls: {
        success: `${siteUrl}/gracias`,
        failure: `${siteUrl}/checkout`,
        pending: `${siteUrl}/checkout`,
      },
      auto_return: "approved",
      statement_descriptor: "MINIFIMY",
      external_reference: `minifimy-${Date.now()}`,
      metadata: {
        city: payload.customer?.city,
        postal_code: payload.customer?.postalCode,
      },
    }),
  });

  if (!preferenceResponse.ok) {
    return NextResponse.json({ message: "Mercado Pago no pudo crear la preferencia." }, { status: 502 });
  }

  const preference = await preferenceResponse.json() as { id?: string; init_point?: string; sandbox_init_point?: string };
  const initPoint = process.env.MERCADO_PAGO_USE_SANDBOX === "true"
    ? preference.sandbox_init_point
    : preference.init_point;

  return NextResponse.json({
    message: "Checkout de Mercado Pago generado.",
    preferenceId: preference.id,
    initPoint,
  });
}
