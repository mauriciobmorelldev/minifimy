import { getProductSuggestionRequestUrl } from "@/hooks/use-product-suggestions";

describe("product suggestions", () => {
  it("waits until the customer types three letters", () => {
    expect(getProductSuggestionRequestUrl("bo")).toBeNull();
    expect(getProductSuggestionRequestUrl("  bo  ")).toBeNull();
  });

  it("requests four recommendations before the customer starts typing", () => {
    expect(getProductSuggestionRequestUrl("", true)).toBe(
      "/api/productos?suggestions=1&recommendations=1&limit=4",
    );
  });

  it("requests a limited suggestion list from the third letter", () => {
    expect(getProductSuggestionRequestUrl("bod", true)).toBe("/api/productos?q=bod&suggestions=1&limit=4");
  });

  it("encodes spaces and accents without requiring a form submit", () => {
    expect(getProductSuggestionRequestUrl("recién nacido")).toBe(
      "/api/productos?q=reci%C3%A9n%20nacido&suggestions=1&limit=4",
    );
  });
});
