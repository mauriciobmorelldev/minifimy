import { NextResponse, type NextRequest } from "next/server";
import { getStorePreviewConfig, hasStorePreviewAccess, previewCookie, previewNoCache, waitingHeader } from "@/lib/store-preview-access";

export function proxy(request: NextRequest) {
  const config = getStorePreviewConfig();
  if (!config) return NextResponse.next();

  const headers = new Headers(request.headers);
  headers.delete(waitingHeader);
  const isWaiting = Date.now() < config.opensAt;
  const path = request.nextUrl.pathname;
  const token = request.cookies.get(previewCookie)?.value;
  const hasAccess = isWaiting && hasStorePreviewAccess(token, config);

  if (path === "/espera" && (!isWaiting || hasAccess)) {
    return NextResponse.redirect(new URL("/", request.url), { status: 303, headers: { "Cache-Control": previewNoCache } });
  }

  if (isWaiting && !hasAccess && path !== "/api/preview") {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "La tienda abre pronto." }, { status: 403, headers: { "Cache-Control": previewNoCache } });
    }
    if (path !== "/espera") {
      return NextResponse.redirect(new URL("/espera", request.url), { status: 303, headers: { "Cache-Control": previewNoCache } });
    }
    if (request.nextUrl.searchParams.get("error") === "1") headers.set(waitingHeader, "error");
  }

  const response = NextResponse.next({ request: { headers } });
  if (isWaiting) {
    response.headers.set("Cache-Control", previewNoCache);
    response.headers.set("X-Robots-Tag", "noindex");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|brand/|products/|favicon.ico|icon|robots.txt|sitemap.xml|api/revalidate).*)"],
};
