import { NextRequest, NextResponse } from "next/server";
import {
  createStoreOrder,
  getStorePaymentMethods,
  getStoreProducts,
  getStoreShippingMethods,
} from "@/lib/woocommerce";

interface CheckoutItem {
  product?: { id?: string };
  selection?: { size?: string; color?: string; variationId?: string };
  quantity?: number;
}

interface CheckoutPayload {
  items?: CheckoutItem[];
  paymentMethodId?: string;
  shippingMethodId?: string;
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    notes?: string;
  };
}

const MAX_CHECKOUT_ITEMS = 20;
const MAX_QUANTITY_PER_ITEM = 10;

function isValidEmail(value?: string) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

function hasRequiredCustomerData(customer?: CheckoutPayload["customer"]) {
  return Boolean(
    customer?.name &&
      customer.email &&
      customer.phone &&
      customer.address &&
      customer.city &&
      customer.postalCode &&
      isValidEmail(customer.email)
  );
}

export async function GET() {
  const [paymentMethods, shippingMethods] = await Promise.all([
    getStorePaymentMethods(),
    getStoreShippingMethods(),
  ]);

  return NextResponse.json({ paymentMethods, shippingMethods });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as CheckoutPayload | null;

  if (!payload?.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    return NextResponse.json({ message: "Carrito invalido." }, { status: 400 });
  }

  if (payload.items.length > MAX_CHECKOUT_ITEMS) {
    return NextResponse.json({ message: "Demasiados productos en el carrito." }, { status: 400 });
  }

  if (!hasRequiredCustomerData(payload.customer)) {
    return NextResponse.json({ message: "Datos de cliente incompletos." }, { status: 400 });
  }

  if (!payload.paymentMethodId || !payload.shippingMethodId) {
    return NextResponse.json({ message: "Selecciona pago y envio." }, { status: 400 });
  }

  const customer = payload.customer;

  const storeProducts = await getStoreProducts({ perPage: 100 });
  const storeProductsById = new Map(storeProducts.map((product) => [product.id, product]));

  const safeItems = payload.items.map((item) => {
    const productId = item.product?.id;
    const product = productId ? storeProductsById.get(productId) : null;
    const quantity = Math.min(Math.max(Number(item.quantity) || 1, 1), MAX_QUANTITY_PER_ITEM);
    return product ? { productId: product.id, quantity, selection: item.selection } : null;
  }).filter(Boolean) as { productId: string; quantity: number; selection?: { size?: string; color?: string; variationId?: string } }[];

  if (safeItems.length === 0) {
    return NextResponse.json({ message: "No encontramos productos validos para cobrar." }, { status: 400 });
  }

  const order = await createStoreOrder({
    customer: {
      name: customer!.name!,
      email: customer!.email!,
      phone: customer!.phone!,
      address: customer!.address!,
      city: customer!.city!,
      postalCode: customer!.postalCode!,
      notes: customer!.notes,
    },
    items: safeItems,
    paymentMethodId: payload.paymentMethodId,
    shippingMethodId: payload.shippingMethodId,
  });

  if (!order) {
    return NextResponse.json({ message: "No pudimos preparar tu pedido. Intentemos de nuevo." }, { status: 502 });
  }

  return NextResponse.json({
    message: "Pedido preparado.",
    orderId: order.id,
    orderKey: order.orderKey,
    paymentUrl: order.paymentUrl,
  });
}
