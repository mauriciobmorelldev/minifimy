import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { CACHE_TAGS } from "@/lib/cache";

const allowedTags = new Set<string>(Object.values(CACHE_TAGS));

function tagsFromWebhookTopic(topic: string | null) {
  const normalized = topic?.toLowerCase() ?? "";
  if (normalized.includes("product")) return [CACHE_TAGS.products, CACHE_TAGS.categories];
  if (normalized.includes("category") || normalized.includes("term")) return [CACHE_TAGS.categories, CACHE_TAGS.products];
  if (normalized.includes("order") || normalized.includes("payment") || normalized.includes("shipping")) return [CACHE_TAGS.checkout];
  return Object.values(CACHE_TAGS);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const secret = request.headers.get("x-revalidate-secret") ?? url.searchParams.get("secret");

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tags?: string[]; topic?: string };
  const webhookTopic = request.headers.get("x-wc-webhook-topic") ?? body.topic ?? null;
  const requestedTags = body.tags?.length ? body.tags : tagsFromWebhookTopic(webhookTopic);
  const tags = requestedTags.filter((tag) => allowedTags.has(tag));

  tags.forEach((tag) => revalidateTag(tag, "max"));

  return NextResponse.json({ ok: true, tags, revalidatedAt: new Date().toISOString() });
}