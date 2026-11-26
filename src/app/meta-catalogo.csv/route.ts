import { getStoreProductsForMetaFeed } from "@/lib/woocommerce";
import { getBlackFridayPrice } from "@/lib/black-friday";
import { campaignEndsAt, isBlackFridayActive } from "@/lib/black-friday-server";
import { getStorePreviewConfig } from "@/lib/store-preview-access";

const site = "https://minifimy.com";
const columns = ["id", "title", "description", "availability", "inventory", "condition", "price", "link", "image_link", "brand", "sale_price", "sale_price_effective_date"];

function metaDate(timestamp: number) {
  return `${new Date(timestamp).toISOString().slice(0, 16)}+0000`;
}

function csvRow(values: Array<string | number | undefined>) {
  return values.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",");
}

export async function GET() {
  try {
    const campaign = isBlackFridayActive();
    const phase = campaign ? "black-friday" : Date.now() >= campaignEndsAt ? "after-black-friday" : "regular";
    const products = await getStoreProductsForMetaFeed(phase);
    const opening = getStorePreviewConfig()?.opensAt ?? Date.parse("2026-11-26T00:00:00-03:00");
    const saleDates = campaign ? `${metaDate(opening)}/${metaDate(campaignEndsAt)}` : undefined;
    const rows = new Map<string, string>();
    for (const product of products) {
      if (!product.title || !product.slug || !product.image || !Number.isFinite(product.price) || product.price <= 1) continue;
      if (!/^\d+$/.test(product.id) || !URL.canParse(product.image, site)) continue;
      const image = new URL(product.image, site);
      if (image.protocol !== "https:" && image.protocol !== "http:") continue;
      const discount = campaign ? getBlackFridayPrice(product.price)?.final : product.discountPrice;
      const validDiscount = discount !== undefined && discount > 0 && discount < product.price;
      const description = `${validDiscount ? "Precio de oferta abonando por transferencia. " : ""}${product.description || product.title}`;

      rows.set(product.id, csvRow([
        product.id,
        product.title.slice(0, 200),
        description.slice(0, 9999),
        product.inStock ? "in stock" : "out of stock",
        product.stock,
        "new",
        `${product.price.toFixed(2)} ARS`,
        `${site}/producto/${encodeURIComponent(product.slug)}`,
        image.href,
        product.brand.slice(0, 100),
        validDiscount ? `${discount.toFixed(2)} ARS` : undefined,
        validDiscount ? saleDates : undefined,
      ]));
    }
    if (!rows.size) throw new Error("El catálogo no contiene productos exportables.");

    return new Response(`${[columns.join(","), ...rows.values()].join("\r\n")}\r\n`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=300",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch {
    // A temporary upstream failure must not replace a valid Meta catalog with an empty feed.
    return new Response("El catálogo de MiniFimy no está disponible temporalmente.", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "300" },
    });
  }
}
