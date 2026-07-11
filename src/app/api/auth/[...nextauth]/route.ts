import { NextResponse } from "next/server";
import { getWooStorefrontUrls } from "@/lib/woocommerce";

export function GET() {
  return NextResponse.redirect(getWooStorefrontUrls().account);
}

export const POST = GET;
