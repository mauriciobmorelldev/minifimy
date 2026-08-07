import { getDisplayPrice } from "@/components/ProductPrice";

describe("getDisplayPrice", () => {
  it("keeps the configured list price above the transfer price", () => {
    expect(getDisplayPrice(19_200, { base: 19_200, list: 34_300, discount: 24_010 })).toMatchObject({
      listPrice: 34_300,
      finalPrice: 24_010,
      transferPrice: 24_010,
      hasDiscount: true,
      discountPercent: 30,
    });
  });

  it("falls back to the base product price when no separate list exists", () => {
    expect(getDisplayPrice(14_900, { base: 14_900 })).toMatchObject({
      listPrice: 14_900,
      finalPrice: 14_900,
      hasDiscount: false,
    });
  });
});
