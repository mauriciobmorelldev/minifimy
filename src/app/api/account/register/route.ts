import { NextRequest, NextResponse } from "next/server";
import { createStoreCustomer } from "@/lib/woocommerce";

function isValidEmail(value?: string) {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    phone?: string;
  } | null;

  if (!payload?.firstName || !isValidEmail(payload.email) || !payload.password || payload.password.length < 8) {
    return NextResponse.json({ message: "Completa nombre, email valido y clave de al menos 8 caracteres." }, { status: 400 });
  }

  const customer = await createStoreCustomer({
    email: payload.email!,
    firstName: payload.firstName,
    lastName: payload.lastName,
    password: payload.password,
    phone: payload.phone,
  });

  if (!customer) {
    return NextResponse.json({ message: "WooCommerce no pudo crear la cuenta. Revisa si el email ya existe." }, { status: 502 });
  }

  return NextResponse.json({ message: "Cuenta creada en WooCommerce.", customer });
}
