import { parseProductAudience, parseProductAudiences, productMatchesAudience } from "@/lib/catalog-audience";

it("normalizes audience metadata saved by WooCommerce", () => {
  expect(parseProductAudiences(["ninas", "ninos", "invalid"])).toEqual(["ninas", "ninos"]);
  expect(parseProductAudiences('["bebes","ninas"]')).toEqual(["bebes", "ninas"]);
  expect(parseProductAudience("ninos")).toBe("ninos");
  expect(parseProductAudience("invalid")).toBeUndefined();
});

it("keeps unclassified products visible and restricts classified products", () => {
  expect(productMatchesAudience([], "ninas")).toBe(true);
  expect(productMatchesAudience(undefined, "ninos")).toBe(true);
  expect(productMatchesAudience(["ninas"], "ninas")).toBe(true);
  expect(productMatchesAudience(["ninas"], "ninos")).toBe(false);
  expect(productMatchesAudience(["ninas", "ninos"], "ninos")).toBe(true);
});
