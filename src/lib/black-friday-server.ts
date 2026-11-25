import { blackFridayPreview } from "@/lib/black-friday";

const livePreviewStartsAt = Date.parse("2026-11-25T18:00:00-03:00");
const campaignEndsAt = Date.parse("2026-11-30T00:00:00-03:00");

export function isBlackFridayActive() {
  const now = Date.now();
  return blackFridayPreview || (
    process.env.MINIFIMY_BLACK_FRIDAY_LIVE === "true" &&
    now >= livePreviewStartsAt && now < campaignEndsAt
  );
}
