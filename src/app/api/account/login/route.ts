import { NextRequest, NextResponse } from "next/server";
import { loginStoreCustomer } from "@/lib/woocommerce";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as { email?: string; password?: string } | null;

  if (!payload?.email || !payload.password) {
    return NextResponse.json({ message: "Ingresa email y clave." }, { status: 400 });
  }

  const session = await loginStoreCustomer(payload.email, payload.password);
  if (!session) {
    return NextResponse.json(
      { message: "No pudimos iniciar sesión con esos datos." },
      { status: 401 }
    );
  }

  return NextResponse.json({ message: "Sesión iniciada desde Fimy.", session });
}
