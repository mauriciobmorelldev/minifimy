import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { message: "Auth visual vive en Next. Usa /api/account/login o /api/account/register para operar contra WordPress/WooCommerce." },
    { status: 410 }
  );
}

export const POST = GET;
