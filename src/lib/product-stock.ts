import type { Product, ProductVariant } from "@/models/product";

export function variantIsInStock(variant?: ProductVariant) {
  if (!variant) return false;
  if (variant.stockStatus === "outofstock") return false;
  return variant.stock === undefined || variant.stock > 0;
}

export function productIsInStock(product: Product) {
  if (product.stockStatus === "outofstock") return false;
  if (product.variants?.length) {
    return product.variants.some(variantIsInStock);
  }
  return product.stock > 0;
}
