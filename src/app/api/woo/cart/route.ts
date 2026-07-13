import { NextRequest } from "next/server";
import { proxyWooStoreRequest } from "@/lib/woo-store-api";

export async function GET(request: NextRequest) {
  return proxyWooStoreRequest({ path: "/cart", request });
}
