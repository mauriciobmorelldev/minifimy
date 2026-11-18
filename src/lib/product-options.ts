import { variantIsInStock } from "@/lib/product-stock";
import type { Product, ProductSelection, ProductVariant } from "@/models/product";

export type ProductOption = "size" | "color" | "model";

export function getProductOptions(product: Product) {
  return {
    size: Array.from(new Set([...(product.sizes ?? []), ...(product.variants?.flatMap((variant) => variant.size ? [variant.size] : []) ?? [])])),
    color: product.colors ?? [],
    model: product.models ?? [],
  };
}

export function getDefaultProductVariant(product: Product) {
  return product.variants?.find(variantIsInStock) ?? product.variants?.[0];
}

export function normalizeOption(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function optionsEqual(first?: string, second?: string) {
  return normalizeOption(first) === normalizeOption(second);
}

function optionMatches(selected?: string, actual?: string) {
  return !selected || !actual || optionsEqual(selected, actual);
}

export function variantMatchesOptions(variant: ProductVariant, selection: ProductSelection) {
  return (
    optionMatches(selection.size, variant.size) &&
    optionMatches(selection.color, variant.color) &&
    optionMatches(selection.model, variant.model)
  );
}

export function productNeedsOptions(product: Product) {
  return product.type === "variable" || Boolean(product.variants?.length);
}
