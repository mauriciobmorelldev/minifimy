import { NextRequest } from "next/server";
import { proxyWooStoreRequest, readJsonBody } from "@/lib/woo-store-api";

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  return proxyWooStoreRequest({ path: "/cart/update-item", method: "POST", body, request });
}
