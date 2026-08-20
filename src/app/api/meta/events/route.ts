import { createHash, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { MetaCustomData, MetaEventName } from "@/lib/meta-events";
import { getStoreOrderForPayment } from "@/lib/woocommerce";

const ALLOWED_EVENTS = new Set<MetaEventName>([
  "PageView",
  "ViewCategory",
  "ViewContent",
  "AddToCart",
  "RemoveFromCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
]);
const META_PIXEL_ID = process.env.META_PIXEL_ID ?? process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1130501562085721";
const META_API_VERSION = process.env.META_GRAPH_API_VERSION ?? "v23.0";
const META_ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN;
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;
const EVENT_USER_COOKIE = "minifimy_meta_user";

interface MetaEventRequest {
  eventName?: MetaEventName;
  eventId?: string;
  eventSourceUrl?: string;
  customData?: MetaCustomData;
  order?: { id?: number; key?: string };
}

function hash(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined;
}

function getSafeSourceUrl(request: NextRequest, value?: string) {
  try {
    const url = new URL(value ?? request.nextUrl.origin);
    const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
      : request.nextUrl.origin;
    return url.origin === configuredOrigin || url.origin === request.nextUrl.origin ? url.toString() : configuredOrigin;
  } catch {
    return request.nextUrl.origin;
  }
}

function asFiniteNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function sanitizeCustomData(value: MetaCustomData | undefined): MetaCustomData {
  if (!value) return {};
  const stringKeys = [
    "content_name",
    "content_category",
    "content_type",
    "currency",
    "variant_id",
    "size",
    "color",
    "model",
    "variant",
    "payment_method",
  ];
  const numberKeys = ["value", "quantity", "num_items"];
  const result: MetaCustomData = {};

  for (const key of stringKeys) {
    if (typeof value[key] === "string") result[key] = String(value[key]).slice(0, 300);
  }
  for (const key of numberKeys) {
    const number = asFiniteNumber(value[key]);
    if (number !== undefined) result[key] = number;
  }
  if (Array.isArray(value.content_ids)) {
    result.content_ids = value.content_ids.slice(0, 50).map(String);
  }
  if (Array.isArray(value.contents)) {
    result.contents = value.contents.slice(0, 50).flatMap((entry) => {
      if (!entry || typeof entry !== "object" || !("id" in entry)) return [];
      const item = entry as Record<string, unknown>;
      const itemPrice = asFiniteNumber(item.item_price);
      return [{
        id: String(item.id),
        quantity: asFiniteNumber(item.quantity) ?? 1,
        ...(itemPrice !== undefined ? { item_price: itemPrice } : {}),
      }];
    });
  }

  return result;
}

async function getPurchaseData(payload: MetaEventRequest) {
  const orderId = Number(payload.order?.id);
  const orderKey = payload.order?.key;
  if (!Number.isInteger(orderId) || orderId <= 0 || !orderKey) return null;

  const order = await getStoreOrderForPayment(String(orderId), orderKey);
  if (!order || order.orderKey !== orderKey || (!order.datePaid && order.status !== "completed")) return null;

  return {
    customData: {
      content_ids: order.items.map((item) => String(item.productId || item.id)),
      content_name: `Pedido #${order.id}`,
      content_type: "product",
      contents: order.items.map((item) => ({
        id: String(item.productId || item.id),
        quantity: item.quantity,
        item_price: item.quantity > 0 ? Number(item.total) / item.quantity : Number(item.total),
      })),
      currency: order.currency || "ARS",
      value: Number(order.total),
      num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
    },
    email: order.customerEmail,
    phone: order.customerPhone,
  };
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as MetaEventRequest | null;
  if (!payload?.eventName || !ALLOWED_EVENTS.has(payload.eventName)) {
    return NextResponse.json({ message: "Evento no permitido." }, { status: 400 });
  }
  if (!payload.eventId || !/^[a-zA-Z0-9._:-]{1,128}$/.test(payload.eventId)) {
    return NextResponse.json({ message: "event_id inválido." }, { status: 400 });
  }

  let customData = sanitizeCustomData(payload.customData);
  let email: string | undefined;
  let phone: string | undefined;
  if (payload.eventName === "Purchase") {
    const purchase = await getPurchaseData(payload);
    if (!purchase) return NextResponse.json({ message: "La compra todavía no está confirmada." }, { status: 409 });
    customData = purchase.customData;
    email = purchase.email;
    phone = purchase.phone;
  }

  const existingUserId = request.cookies.get(EVENT_USER_COOKIE)?.value;
  const eventUserId = existingUserId && /^[a-zA-Z0-9-]{8,80}$/.test(existingUserId) ? existingUserId : randomUUID();
  const phoneDigits = phone?.replace(/\D/g, "");
  const userData = {
    client_user_agent: request.headers.get("user-agent") ?? undefined,
    client_ip_address: getClientIp(request),
    fbp: request.cookies.get("_fbp")?.value,
    fbc: request.cookies.get("_fbc")?.value,
    external_id: [hash(eventUserId)],
    ...(email ? { em: [hash(email)] } : {}),
    ...(phoneDigits ? { ph: [hash(phoneDigits)] } : {}),
  };

  if (!META_ACCESS_TOKEN) {
    return NextResponse.json({ received: true, sent: false, reason: "capi_not_configured" });
  }

  const metaResponse = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{
        event_name: payload.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: payload.eventId,
        event_source_url: getSafeSourceUrl(request, payload.eventSourceUrl),
        action_source: "website",
        user_data: userData,
        custom_data: customData,
      }],
      access_token: META_ACCESS_TOKEN,
      ...(META_TEST_EVENT_CODE ? { test_event_code: META_TEST_EVENT_CODE } : {}),
    }),
    cache: "no-store",
  }).catch(() => null);

  const response = NextResponse.json(
    { received: true, sent: Boolean(metaResponse?.ok) },
    { status: metaResponse?.ok ? 200 : 502 },
  );
  if (!existingUserId) {
    response.cookies.set(EVENT_USER_COOKIE, eventUserId, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return response;
}
