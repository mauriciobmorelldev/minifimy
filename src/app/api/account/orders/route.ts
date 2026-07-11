import { NextRequest, NextResponse } from "next/server";
import { getStoreOrdersForCustomerEmail, verifyWordPressCustomerToken } from "@/lib/woocommerce";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ message: "Sesion requerida." }, { status: 401 });
  }

  const user = await verifyWordPressCustomerToken(token);
  if (!user?.email) {
    return NextResponse.json({ message: "WordPress no pudo validar la sesion." }, { status: 401 });
  }

  const orders = await getStoreOrdersForCustomerEmail(user.email);
  return NextResponse.json({ orders });
}
