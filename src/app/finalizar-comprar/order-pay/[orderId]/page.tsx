import type { Metadata } from "next";
import { OrderPaymentView } from "@/components/order/OrderPaymentView";
import { getStoreOrderForPayment } from "@/lib/woocommerce";

interface FinalizarCompraOrderPayPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ key?: string; pay?: string; pay_for_order?: string }>;
}

export const metadata: Metadata = {
  title: "Pagar pedido",
  description: "Resumen de pedido Minifimy.",
};

export default async function FinalizarCompraOrderPayPage({ params, searchParams }: FinalizarCompraOrderPayPageProps) {
  const { orderId } = await params;
  const query = await searchParams;
  const order = await getStoreOrderForPayment(orderId, query.key);

  return <OrderPaymentView order={order} paymentUrl={order?.paymentUrl} />;
}