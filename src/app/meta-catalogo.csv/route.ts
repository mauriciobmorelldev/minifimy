import { getStoreProductsForMetaFeed } from "@/lib/woocommerce";

const site = "https://minifimy.com";
const columns = ["id", "title", "description", "availability", "inventory", "condition", "price", "link", "image_link", "brand"];

function csvRow(values: Array<string | number | undefined>) {
  return values.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",");
}

export async function GET() {
  try {
    const products = await getStoreProductsForMetaFeed();
    const rows = new Map<string, string>();
    for (const product of products) {
      if (!product.title || !product.slug || !product.image || !Number.isFinite(product.price) || product.price <= 1) continue;
      if (!/^\d+$/.test(product.id) || !URL.canParse(product.image, site)) continue;
      const image = new URL(product.image, site);
      if (image.protocol !== "https:" && image.protocol !== "http:") continue;

      rows.set(product.id, csvRow([
        product.id,
        product.title.slice(0, 200),
        (product.description || product.title).slice(0, 9999),
        product.inStock ? "in stock" : "out of stock",
        product.stock,
        "new",
        `${product.price.toFixed(2)} ARS`,
        `${site}/producto/${encodeURIComponent(product.slug)}`,
        image.href,
        product.brand.slice(0, 100),
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
