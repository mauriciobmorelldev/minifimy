export type ProductAudience = "bebes" | "ninas" | "ninos";

const PRODUCT_AUDIENCES = new Set<ProductAudience>(["bebes", "ninas", "ninos"]);

export function parseProductAudience(value?: string | null): ProductAudience | undefined {
  return value && PRODUCT_AUDIENCES.has(value as ProductAudience) ? value as ProductAudience : undefined;
}

export function parseProductAudiences(value: unknown): ProductAudience[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : value.split(",");
          } catch {
            return value.split(",");
          }
        })()
      : [];

  return [...new Set(values
    .map((item) => String(item).trim().toLowerCase())
    .filter((item): item is ProductAudience => PRODUCT_AUDIENCES.has(item as ProductAudience)))];
}

export function productMatchesAudience(audiences: ProductAudience[] | undefined, audience?: ProductAudience) {
  return !audience || !audiences?.length || audiences.includes(audience);
}
