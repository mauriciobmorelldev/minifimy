import { getDisplayPrice } from "@/components/ProductPrice";

describe("getDisplayPrice", () => {
  it("recognizes a standard WooCommerce sale", () => {
    expect(getDisplayPrice(800, { base: 800, list: 1_000, sale: 800 })).toMatchObject({
      listPrice: 1_000,
      cardPrice: 800,
      finalPrice: 800,
      hasSale: true,
      hasTransferDiscount: false,
      hasDiscount: true,
      saleDiscountPercent: 20,
    });
  });

  it("keeps transfer discounts separate from standard sales", () => {
    expect(getDisplayPrice(1_000, { base: 1_000, list: 1_000, discount: 800 })).toMatchObject({
      cardPrice: 1_000,
      finalPrice: 800,
      hasSale: false,
      hasTransferDiscount: true,
      discountPercent: 20,
    });
  });

  it("applies a transfer benefit over an existing sale price", () => {
    expect(getDisplayPrice(900, { base: 900, list: 1_000, sale: 900, discount: 810 })).toMatchObject({
      listPrice: 1_000,
      cardPrice: 900,
      finalPrice: 810,
      hasSale: true,
      hasTransferDiscount: true,
      saleDiscountPercent: 10,
      discountPercent: 10,
    });
  });
});
