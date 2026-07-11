import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      message: "Tu bolsita se guarda en este dispositivo hasta preparar el pedido.",
    },
    { status: 410 }
  );
}