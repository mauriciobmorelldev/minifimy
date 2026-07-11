import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      message: "El carrito no se persiste en Next. La orden, cliente, envio y pago se crean en Fimy al checkout.",
    },
    { status: 410 }
  );
}