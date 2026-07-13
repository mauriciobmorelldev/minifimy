import { NextRequest, NextResponse } from "next/server";
import {
  getStorePaymentMethods,
  getStoreShippingMethods,
} from "@/lib/woocommerce";
import { proxyWooStoreRequest } from "@/lib/woo-store-api";

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

  if (!hasRequiredCustomerData(payload?.customer)) {
    return NextResponse.json({ message: "Datos de cliente incompletos." }, { status: 400 });
  }

  if (!payload?.paymentMethodId) {
    return NextResponse.json({ message: "Seleccioná un método de pago." }, { status: 400 });
  }

  const [firstName, ...lastNameParts] = payload.customer!.name!.trim().split(/\s+/);
  const address = {
    first_name: firstName || payload.customer!.name!,
    last_name: lastNameParts.join(" "),
    email: payload.customer!.email!,
    phone: payload.customer!.phone!,
    address_1: payload.customer!.address!,
    city: payload.customer!.city!,
    postcode: payload.customer!.postalCode!,
    country: "AR",
  };

  return proxyWooStoreRequest({
    path: "/checkout",
    method: "POST",
    request,
    body: {
      billing_address: address,
      shipping_address: address,
      payment_method: payload.paymentMethodId,
      customer_note: payload.customer!.notes ?? "",
    },
  });
}
