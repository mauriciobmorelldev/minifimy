import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Todavia no pudimos suscribirte. Escribinos y te sumamos." },
    { status: 501 }
  );
}
