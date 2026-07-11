import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Configura WORDPRESS_NEWSLETTER_URL para enviar altas de newsletter a Fimy." },
    { status: 501 }
  );
}
