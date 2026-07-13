import { NextRequest, NextResponse } from "next/server";

const storeOrigin = (() => {
  const storeUrl = process.env.WOOCOMMERCE_URL ?? process.env.WORDPRESS_URL;
  if (!storeUrl) return null;

  try {
    return new URL(storeUrl).origin;
  } catch {
    return null;
  }
})();

const STORE_API_BASE = "/wp-json/wc/store/v1";
const COOKIE_NAMES_TO_KEEP = [
  "woocommerce_cart_hash",
  "woocommerce_items_in_cart",
  "wp_woocommerce_session_",
  "woocommerce_recently_viewed",
  "wordpress_logged_in_",
  "wp-settings-",
];

export interface WooStoreRequestOptions {
  path: string;
  method?: string;
  body?: unknown;
  request: NextRequest;
}

function getStoreUrl(path: string) {
  if (!storeOrigin) return null;
  return new URL(`${STORE_API_BASE}${path}`, storeOrigin);
}

function extractUsefulCookies(cookieHeader: string | null) {
  if (!cookieHeader) return "";
  return cookieHeader
    .split(/;\s*/)
    .filter((cookie) => COOKIE_NAMES_TO_KEEP.some((name) => cookie.startsWith(name)))
    .join("; ");
}

function getForwardHeaders(request: NextRequest, contentType = "application/json") {
  const headers = new Headers();
  const cookie = extractUsefulCookies(request.headers.get("cookie"));
  const nonce = request.headers.get("nonce") ?? request.headers.get("x-wc-store-api-nonce");
  const cartToken = request.headers.get("cart-token") ?? request.headers.get("x-wc-store-api-cart-token");

  headers.set("accept", "application/json");
  headers.set("content-type", contentType);
  headers.set("user-agent", request.headers.get("user-agent") ?? "Minifimy Store API BFF");
  if (cookie) headers.set("cookie", cookie);
  if (nonce) headers.set("nonce", nonce);
  if (cartToken) headers.set("cart-token", cartToken);

  return headers;
}

function appendResponseCookies(source: Response, target: NextResponse) {
  const setCookie = source.headers.get("set-cookie");
  if (!setCookie) return;

  target.headers.append("set-cookie", setCookie);
}

function appendStoreHeaders(source: Response, target: NextResponse) {
  const nonce = source.headers.get("nonce");
  const cartToken = source.headers.get("cart-token");
  if (nonce) target.headers.set("nonce", nonce);
  if (cartToken) target.headers.set("cart-token", cartToken);
}

function getCookiePairsFromResponse(response: Response | null) {
  const setCookie = response?.headers.get("set-cookie");
  if (!setCookie) return [];

  return setCookie
    .split(/,(?=\s*[^;,=]+=[^;,]+)/)
    .map((cookie) => cookie.trim().split(";")[0])
    .filter(Boolean);
}

function mergeCookieHeader(headers: Headers, cookiePairs: string[]) {
  if (cookiePairs.length === 0) return;
  const current = headers.get("cookie");
  headers.set("cookie", [current, ...cookiePairs].filter(Boolean).join("; "));
}

async function refreshStoreSession(headers: Headers) {
  const cartUrl = getStoreUrl("/cart");
  if (!cartUrl) return null;

  const response = await fetch(cartUrl, {
    method: "GET",
    headers,
    cache: "no-store",
  }).catch(() => null);

  const nonce = response?.headers.get("nonce");
  const cartToken = response?.headers.get("cart-token");
  if (nonce) headers.set("nonce", nonce);
  if (cartToken) headers.set("cart-token", cartToken);
  mergeCookieHeader(headers, getCookiePairsFromResponse(response));

  return response;
}

export async function proxyWooStoreRequest({ path, method = "GET", body, request }: WooStoreRequestOptions) {
  const url = getStoreUrl(path);
  if (!url) {
    return NextResponse.json({ message: "No está configurada la tienda." }, { status: 500 });
  }

  const headers = getForwardHeaders(request);
  const requestBody = body === undefined ? undefined : JSON.stringify(body);
  const isMutation = method.toUpperCase() !== "GET";

  if (isMutation && !headers.has("nonce")) {
    await refreshStoreSession(headers);
  }

  let response = await fetch(url, {
    method,
    headers,
    body: requestBody,
    cache: "no-store",
    redirect: "manual",
  });

  if (isMutation && response.status === 403) {
    await refreshStoreSession(headers);
    response = await fetch(url, {
      method,
      headers,
      body: requestBody,
      cache: "no-store",
      redirect: "manual",
    });
  }

  const contentType = response.headers.get("content-type") ?? "application/json; charset=utf-8";
  const responseBody = await response.text();
  const nextResponse = new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store, no-cache, must-revalidate",
    },
  });

  appendResponseCookies(response, nextResponse);
  appendStoreHeaders(response, nextResponse);

  return nextResponse;
}

export async function readJsonBody(request: NextRequest) {
  return request.json().catch(() => ({}));
}
