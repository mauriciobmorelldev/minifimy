import type { Metadata } from "next";
import Link from "next/link";
import { MetaEvent } from "@/components/MetaEvent";
import { getStoreOrderForPayment } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "Gracias",
  description: "Compra confirmada en MiniFimy.",
};

interface ThankYouPageProps {
  searchParams: Promise<{ pedido?: string; order?: string; key?: string }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const query = await searchParams;
  const orderId = query.pedido ?? query.order;
  const order = orderId && query.key ? await getStoreOrderForPayment(orderId, query.key) : null;
  const isPaid = Boolean(order?.datePaid) || order?.status === "completed";
  const purchaseData = order && isPaid
    ? {
        content_ids: order.items.map((item) => String(item.productId || item.id)),
        content_name: `Pedido #${order.id}`,
        content_type: "product",
        contents: order.items.map((item) => ({
          id: String(item.productId || item.id),
          quantity: item.quantity,
          item_price: item.quantity > 0 ? Number(item.total) / item.quantity : Number(item.total),
        })),
        currency: order.currency || "ARS",
        value: Number(order.total),
        num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      }
    : null;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-24">
      {purchaseData && order?.orderKey ? (
        <MetaEvent
          name="Purchase"
          eventKey={`purchase-${order.id}`}
          eventId={`purchase-${order.id}`}
          data={purchaseData}
          order={{ id: order.id, key: order.orderKey }}
        />
      ) : null}
      <div className="rounded-lg bg-surface-container-low p-10 text-center shadow-soft">
        <h1 className="text-3xl font-semibold text-on-surface font-headline">
          ¡Gracias por tu compra!
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Te vamos a enviar un email con los detalles y el estado del pedido.
        </p>
        <Link href="/catalogo" className="btn-primary mt-6 inline-flex">
          Seguir comprando
        </Link>
      </div>
    </main>
  );
}
