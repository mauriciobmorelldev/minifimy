import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { message: "Esta ruta ya no esta disponible." },
    { status: 410 }
  );
}

export const POST = GET;
