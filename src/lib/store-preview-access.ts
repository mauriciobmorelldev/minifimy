import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const previewCookie = "minifimy_preview";
export const waitingHeader = "x-minifimy-waiting";
export const previewNoCache = "private, no-store";

const defaultOpening = "2026-11-26T00:00:00-03:00";

export function getStorePreviewConfig() {
  const password = process.env.MINIFIMY_PREVIEW_PASSWORD;
  const opensAt = Date.parse(process.env.MINIFIMY_PREVIEW_OPENS_AT ?? defaultOpening);
  return password && password.length >= 16 && Number.isFinite(opensAt) ? { password, opensAt } : undefined;
}

export function getPreviewRemainingMs(opensAt: number) {
  return Math.max(0, opensAt - Date.now());
}

export function isOpeningRevealWindow(opensAt: number) {
  const elapsedMs = Date.now() - opensAt;
  return elapsedMs >= 0 && elapsedMs < 10 * 60 * 1000;
}

export function matchesPreviewPassword(input: string, password: string) {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(input), digest(password));
}

export function createPreviewToken({ password, opensAt }: NonNullable<ReturnType<typeof getStorePreviewConfig>>) {
  return createHmac("sha256", password).update(`minifimy-preview:${opensAt}`).digest("base64url");
}

export function hasStorePreviewAccess(token: string | undefined, config: NonNullable<ReturnType<typeof getStorePreviewConfig>>) {
  return Boolean(token && matchesPreviewPassword(token, createPreviewToken(config)));
}
