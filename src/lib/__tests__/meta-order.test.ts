import { getMetaPurchaseData, isMetaPurchaseOrder } from "@/lib/meta-order";
import type { StoreOrderPaymentDetails } from "@/lib/woocommerce";

const pendingOrder: StoreOrderPaymentDetails = {
  id: 321,
  status: "pending",
  total: "42500",
  currency: "ARS",
  orderKey: "wc_order_example",
  paymentMethod: "bacs",
  paymentMethodTitle: "Efectivo/transferencia",
  items: [
    { id: 1, productId: 920, name: "Ajuar Bienvenida", quantity: 2, total: "32000" },
    { id: 2, productId: 916, name: "Ajuar Alma", quantity: 1, total: "10500" },
  ],
  shippingLines: [],
};

describe("Meta Purchase orders", () => {
  it("treats a successfully-created pending transfer order as Purchase", () => {
    expect(isMetaPurchaseOrder(pendingOrder)).toBe(true);
    expect(getMetaPurchaseData(pendingOrder)).toEqual({
      order_id: "321",
      content_ids: ["920", "916"],
      content_name: "Pedido #321",
      content_type: "product",
      contents: [
        { id: "920", quantity: 2, item_price: 16000 },
        { id: "916", quantity: 1, item_price: 10500 },
      ],
      currency: "ARS",
      value: 42500,
      num_items: 3,
      payment_method: "bacs",
    });
  });

  it.each(["cancelled", "failed", "refunded", "trash"])("does not track %s orders", (status) => {
    expect(isMetaPurchaseOrder({ ...pendingOrder, status })).toBe(false);
  });
});
