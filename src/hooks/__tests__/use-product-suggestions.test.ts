import { getProductSuggestionRequestUrl } from "@/hooks/use-product-suggestions";

describe("product suggestions", () => {
  it("waits until the customer types three letters", () => {
    expect(getProductSuggestionRequestUrl("bo")).toBeNull();
    expect(getProductSuggestionRequestUrl("  bo  ")).toBeNull();
  });

  it("requests a limited suggestion list from the third letter", () => {
    expect(getProductSuggestionRequestUrl("bod")).toBe("/api/productos?q=bod&limit=6");
  });

  it("encodes spaces and accents without requiring a form submit", () => {
    expect(getProductSuggestionRequestUrl("recién nacido")).toBe(
      "/api/productos?q=reci%C3%A9n%20nacido&limit=6",
    );
  });
});
