import { getMetaCartData, getMetaProductData } from "@/lib/meta-events";
import type { CartItem, Product } from "@/models/product";

const product: Product = {
  id: "42",
  name: "Body MiniFimy",
  slug: "body-minifimy",
  description: "",
  price: 12_000,
  images: [],
  category: "Bodies",
  stock: 5,
  variants: [{ id: "84", size: "3M", color: "Crudo", price: 13_500 }],
};

describe("Meta ecommerce payloads", () => {
  it("includes product, variant, quantity, currency and the selected variant value", () => {
    expect(getMetaProductData(product, 2, {
      variationId: "84",
      size: "3M",
      color: "Crudo",
    })).toMatchObject({
      content_ids: ["42"],
      content_name: "Body MiniFimy",
      content_category: "Bodies",
      content_type: "product",
      currency: "ARS",
      value: 27_000,
      quantity: 2,
      variant_id: "84",
      size: "3M",
      color: "Crudo",
      contents: [{ id: "42", quantity: 2, item_price: 13_500 }],
    });
  });

  it("builds checkout totals and quantities from all cart items", () => {
    const items: CartItem[] = [
      {
        id: "cart-1",
        product,
        quantity: 2,
        selection: { variationId: "84", size: "3M", color: "Crudo" },
      },
      {
        id: "cart-2",
        product: { ...product, id: "43", name: "Ranita", price: 10_000, variants: undefined },
        quantity: 1,
      },
    ];

    expect(getMetaCartData(items, 37_000)).toEqual({
      content_ids: ["42", "43"],
      content_type: "product",
      currency: "ARS",
      value: 37_000,
      num_items: 3,
      contents: [
        { id: "42", quantity: 2, item_price: 13_500 },
        { id: "43", quantity: 1, item_price: 10_000 },
      ],
    });
  });
});
