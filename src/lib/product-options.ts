import type { Product } from "@/models/product";

export function productNeedsOptions(product: Product) {
  return product.type === "variable" || Boolean(product.variants?.length);
}
