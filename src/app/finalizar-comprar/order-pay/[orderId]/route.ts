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

function getCheckoutEnhancement(request: NextRequest) {
  const requestOrigin = getRequestOrigin(request);
  const preferredPaymentMethod = request.nextUrl.searchParams.get("fimy_payment_method") ?? "";
  return `
<style id="minifimy-checkout-style">
  :root { color-scheme: light; }
  body { margin: 0 !important; background: #fff8ef !important; color: #30291f !important; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important; }
  body::before { content: ""; position: fixed; inset: 0; pointer-events: none; background: radial-gradient(circle at 20% 10%, rgba(239,228,208,.85), transparent 28rem), radial-gradient(circle at 80% 20%, rgba(203,217,230,.32), transparent 26rem); z-index: -1; }
  .wp-site-blocks, .site, #page, main, .entry-content, .woocommerce { max-width: 1060px !important; margin-inline: auto !important; padding-inline: 18px !important; }
  header, .wp-block-template-part, footer, .wp-block-navigation, .wc-block-mini-cart, .wp-admin-bar, #wpadminbar { display: none !important; }
  h1, .wp-block-site-title, .entry-title { color: transparent !important; height: 0 !important; margin: 0 !important; overflow: hidden !important; }
  .woocommerce::before { content: "Minifimy"; display: block; width: max-content; margin: 32px auto 18px; padding: 10px 18px; border-radius: 999px; background: rgba(255,255,255,.76); box-shadow: 0 14px 40px rgba(83,69,49,.10); color: #50683d; font-size: 12px; font-weight: 900; letter-spacing: .2em; text-transform: uppercase; }
  .woocommerce-order-pay, .woocommerce { background: rgba(255,255,255,.72) !important; border: 1px solid rgba(234,223,203,.75) !important; border-radius: 34px !important; box-shadow: 0 24px 70px rgba(83,69,49,.11) !important; padding: clamp(20px, 4vw, 44px) !important; }
  table.shop_table { width: 100% !important; border-collapse: separate !important; border-spacing: 0 10px !important; }
  table.shop_table th { color: #50683d !important; font-size: 12px !important; letter-spacing: .16em !important; text-transform: uppercase !important; text-align: left !important; }
  table.shop_table td, table.shop_table th { border: 0 !important; padding: 14px 16px !important; }
  table.shop_table tr { background: #fbf4ea !important; border-radius: 22px !important; }
  #payment, .woocommerce-checkout-payment { margin-top: 22px !important; background: #f7efe3 !important; border-radius: 28px !important; padding: 20px !important; }
  #payment ul.payment_methods { margin: 0 !important; padding: 0 !important; list-style: none !important; }
  #payment li { list-style: none !important; margin: 10px 0 !important; padding: 16px !important; border-radius: 20px !important; background: rgba(255,255,255,.72) !important; }
  #payment li.payment_method_hidden { display: none !important; }
  #payment label { font-weight: 800 !important; color: #30291f !important; }
  .payment_box { display: block !important; background: transparent !important; color: #6d6254 !important; padding: 8px 0 0 !important; }
  button, .button, #place_order { border: 0 !important; border-radius: 999px !important; background: #50683d !important; color: #fffaf1 !important; padding: 15px 24px !important; font-weight: 900 !important; box-shadow: 0 16px 34px rgba(80,104,61,.22) !important; cursor: pointer !important; }
  #minifimy-autopay { position: fixed; inset: 0; display: grid; place-items: center; background: rgba(255,248,239,.92); z-index: 999999; backdrop-filter: blur(8px); }
  #minifimy-autopay > div { max-width: 440px; border-radius: 30px; background: #fffaf1; padding: 28px; box-shadow: 0 24px 70px rgba(83,69,49,.16); text-align: center; color: #30291f; }
  #minifimy-autopay strong { display: block; font-size: 24px; margin-bottom: 8px; }
</style>
<script id="minifimy-checkout-script">
(() => {
  const storeOrigin = ${JSON.stringify(storeOrigin ?? "")};
  const requestOrigin = ${JSON.stringify(requestOrigin)};
  const preferredPaymentMethod = ${JSON.stringify(preferredPaymentMethod)};
  const rewriteUrl = (value) => {
    if (!value || !storeOrigin) return value;
    try {
      const url = new URL(value, requestOrigin);
      if (url.origin === storeOrigin) return requestOrigin + url.pathname + url.search + url.hash;
      return value;
    } catch { return value; }
  };
  document.title = "Finalizar pago | Minifimy";
  document.querySelectorAll("a[href], form[action]").forEach((node) => {
    const attr = node.tagName === "FORM" ? "action" : "href";
    const value = node.getAttribute(attr);
    const rewritten = rewriteUrl(value);
    if (rewritten) node.setAttribute(attr, rewritten);
  });
  const paymentInputs = Array.from(document.querySelectorAll('input[name="payment_method"]'));
  const preferredInput = preferredPaymentMethod
    ? paymentInputs.find((input) => input.value === preferredPaymentMethod)
    : null;
  const checkedInput = paymentInputs.find((input) => input.checked);
  const activePaymentInput = preferredInput || checkedInput || paymentInputs[0] || null;
  if (activePaymentInput) {
    activePaymentInput.disabled = false;
    activePaymentInput.checked = true;
    activePaymentInput.dispatchEvent(new Event("change", { bubbles: true }));
    activePaymentInput.dispatchEvent(new Event("click", { bubbles: true }));
  }
  paymentInputs.forEach((input) => {
    const item = input.closest("li");
    if (!item) return;
    const isActive = Boolean(activePaymentInput && input.value === activePaymentInput.value);
    input.disabled = !isActive;
    input.checked = isActive;
    item.hidden = !isActive;
    item.classList.toggle("payment_method_selected", isActive);
    item.classList.toggle("payment_method_hidden", !isActive);
  });
  const form = document.querySelector('form#order_review, form.woocommerce-order-pay, form.checkout');
  const selectedPayment = activePaymentInput || document.querySelector('input[name="payment_method"]:checked');
  const submitButton = document.querySelector('#place_order, button[name="woocommerce_pay"], button[type="submit"]');
  const storageKey = "minifimy-order-pay-submitted:" + location.pathname + ":" + (selectedPayment?.value ?? preferredPaymentMethod);
  const canAutoSubmit = form && selectedPayment && submitButton;
  if (!canAutoSubmit) return;
  const overlay = document.createElement("div");
  overlay.id = "minifimy-autopay";
  overlay.innerHTML = "<div><strong>Estamos abriendo tu pago</strong><p>Ya usamos el método que elegiste en Minifimy. Te llevamos al paso seguro para completar la compra.</p></div>";
  document.body.appendChild(overlay);
  window.setTimeout(() => {
    sessionStorage.setItem(storageKey, String(Date.now()));
    if (typeof form.requestSubmit === "function") form.requestSubmit(submitButton);
    else submitButton.click();
  }, 450);
})();
</script>`;
}

function injectCheckoutEnhancement(html: string, request: NextRequest) {
  const enhancedHtml = html
    .replaceAll("darkorange-seahorse-714610.hostingersite.com", "Minifimy")
    .replace(/<title>[\s\S]*?<\/title>/i, "<title>Finalizar pago | Minifimy</title>");
  const injection = getCheckoutEnhancement(request);
  return enhancedHtml.includes("</head>")
    ? enhancedHtml.replace("</head>", `${injection}</head>`)
    : `${injection}${enhancedHtml}`;
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
      html = injectCheckoutEnhancement(html, request);
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