import { NextRequest, NextResponse } from "next/server";
import { getStorePaymentMethods } from "@/lib/woocommerce";
import { proxyWooStoreRequest } from "@/lib/woo-store-api";
import {
  COORDINATED_SHIPPING_METHODS,
  getShippingMethod,
  sortPaymentMethods,
} from "@/lib/checkout-options";


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
  const paymentMethods = sortPaymentMethods(await getStorePaymentMethods());
  return NextResponse.json({ paymentMethods, shippingMethods: COORDINATED_SHIPPING_METHODS });
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
  const shippingMethod = getShippingMethod(payload.shippingMethodId ?? "");
  if (!shippingMethod) {
    return NextResponse.json({ message: "Seleccioná un método de envío." }, { status: 400 });
  }

  const customerNote = [
    `Modalidad de envío: ${shippingMethod.title}.`,
    payload.customer!.notes?.trim(),
  ].filter(Boolean).join("\n");

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
      customer_note: customerNote,
    },
  });
}
