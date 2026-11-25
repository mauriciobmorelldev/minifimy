import { NextResponse, type NextRequest } from "next/server";
import { createPreviewToken, getStorePreviewConfig, matchesPreviewPassword, previewCookie, previewNoCache } from "@/lib/store-preview-access";

function goTo(location: string) {
  return new NextResponse(null, { status: 303, headers: { Location: location, "Cache-Control": previewNoCache } });
}

export async function POST(request: NextRequest) {
  const config = getStorePreviewConfig();
  if (!config || Date.now() >= config.opensAt) return goTo("/");

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return new NextResponse(null, { status: 403, headers: { "Cache-Control": previewNoCache } });
  }

  if (Number(request.headers.get("content-length")) > 2048) return goTo("/espera?error=1");
  const password = new URLSearchParams(await request.text()).get("password");
  if (!password || password.length > 256 || !matchesPreviewPassword(password, config.password)) {
    return goTo("/espera?error=1");
  }

  const response = goTo("/");
  response.cookies.set(previewCookie, createPreviewToken(config), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(config.opensAt),
  });
  return response;
}
