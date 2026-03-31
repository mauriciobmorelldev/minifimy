import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/products";

export async function GET(_: NextRequest) {
  return NextResponse.json({ products });
}
