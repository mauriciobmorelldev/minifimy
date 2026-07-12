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

interface OrderPayRouteContext {
  params: Promise<{ orderId: string }>;
}

function getRequestOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  return forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.nextUrl.origin;
}

function buildWooOrderPayUrl(orderId: string, request: NextRequest) {
  if (!storeOrigin) return null;

  const targetUrl = new URL(`/finalizar-comprar/order-pay/${orderId}/`, storeOrigin);
  request.nextUrl.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));
  if (!targetUrl.searchParams.has("pay_for_order")) targetUrl.searchParams.set("pay_for_order", "true");
  return targetUrl;
}

function rewriteLocation(location: string | null, request: NextRequest) {
  if (!location || !storeOrigin) return location;

  try {
    const target = new URL(location, storeOrigin);
    if (target.origin !== storeOrigin) return location;
    return `${getRequestOrigin(request)}${target.pathname}${target.search}${target.hash}`;
  } catch {
    return location;
  }
}

async function proxyOrderPay(request: NextRequest, context: OrderPayRouteContext) {
  const { orderId } = await context.params;
  const targetUrl = buildWooOrderPayUrl(orderId, request);

  if (!targetUrl) {
    return NextResponse.json({ message: "No pudimos abrir el pago." }, { status: 500 });
  }

  const method = request.method;
  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
  const response = await fetch(targetUrl, {
    method,
    body,
    redirect: "manual",
    headers: {
      accept: request.headers.get("accept") ?? "text/html,application/xhtml+xml",
      "content-type": request.headers.get("content-type") ?? "application/x-www-form-urlencoded",
      cookie: request.headers.get("cookie") ?? "",
      "user-agent": request.headers.get("user-agent") ?? "Minifimy checkout proxy",
    },
    cache: "no-store",
  });

  if (response.status >= 300 && response.status < 400) {
    const location = rewriteLocation(response.headers.get("location"), request);
    return location ? NextResponse.redirect(location, response.status) : new NextResponse(null, { status: response.status });
  }

  const contentType = response.headers.get("content-type") ?? "text/html; charset=utf-8";

  if (contentType.includes("text/html")) {
    const requestOrigin = getRequestOrigin(request);
    let html = await response.text();
    if (storeOrigin) {
      html = html
        .replaceAll(storeOrigin, requestOrigin)
        .replaceAll(storeOrigin.replace("https://", "http://"), requestOrigin);
    }

    return new NextResponse(html, {
      status: response.status,
      headers: {
        "content-type": contentType,
        "cache-control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function GET(request: NextRequest, context: OrderPayRouteContext) {
  return proxyOrderPay(request, context);
}

export async function POST(request: NextRequest, context: OrderPayRouteContext) {
  return proxyOrderPay(request, context);
}