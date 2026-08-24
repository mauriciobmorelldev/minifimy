import type { StoreOrderPaymentDetails } from "@/lib/woocommerce";

const NON_PURCHASE_STATUSES = new Set(["cancelled", "failed", "refunded", "trash"]);

export function isMetaPurchaseOrder(order: StoreOrderPaymentDetails | null | undefined) {
  return Boolean(order && !NON_PURCHASE_STATUSES.has(order.status.toLowerCase()));
}

export function getMetaPurchaseData(order: StoreOrderPaymentDetails) {
  return {
    order_id: String(order.id),
    content_ids: order.items.map((item) => String(item.productId || item.id)),
    content_name: `Pedido #${order.id}`,
    content_type: "product",
    contents: order.items.map((item) => ({
      id: String(item.productId || item.id),
      quantity: item.quantity,
      item_price: item.quantity > 0 ? Number(item.total) / item.quantity : Number(item.total),
    })),
    currency: "ARS",
    value: Number(order.total),
    num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
    payment_method: order.paymentMethod,
  };
}
