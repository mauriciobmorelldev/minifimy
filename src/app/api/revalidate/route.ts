import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { CACHE_TAGS } from "@/lib/cache";

const allowedTags = new Set<string>(Object.values(CACHE_TAGS));

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tags?: string[] };
  const tags = body.tags?.filter((tag) => allowedTags.has(tag)) ?? Object.values(CACHE_TAGS);

  tags.forEach((tag) => revalidateTag(tag));

  return NextResponse.json({ ok: true, tags, revalidatedAt: new Date().toISOString() });
}