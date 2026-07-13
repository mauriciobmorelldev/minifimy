import { NextRequest } from "next/server";
import { proxyWooStoreRequest, readJsonBody } from "@/lib/woo-store-api";

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request) as { id?: number; quantity?: number; variation?: unknown; variationId?: number };
  const { variationId, ...storeBody } = body;

  const response = await proxyWooStoreRequest({ path: "/cart/add-item", method: "POST", body: storeBody, request });
  if (response.status !== 400 || !variationId) return response;

  return proxyWooStoreRequest({
    path: "/cart/add-item",
    method: "POST",
    body: { id: variationId, quantity: body.quantity ?? 1 },
    request,
  });
}
