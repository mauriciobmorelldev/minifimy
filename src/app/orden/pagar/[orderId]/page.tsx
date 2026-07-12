import type { Metadata } from "next";
import { OrderPaymentView } from "@/components/order/OrderPaymentView";
import { getStoreOrderForPayment } from "@/lib/woocommerce";

interface OrderPayPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ key?: string; pay?: string }>;
}

export const metadata: Metadata = {
  title: "Pagar pedido",
  description: "Resumen de pedido Minifimy.",
};

function getPaymentUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? value : undefined;
  } catch {
    return undefined;
  }
}

export default async function OrderPayPage({ params, searchParams }: OrderPayPageProps) {
  const { orderId } = await params;
  const query = await searchParams;
  const order = await getStoreOrderForPayment(orderId, query.key);
  const paymentUrl = getPaymentUrl(query.pay) ?? order?.paymentUrl;

  return <OrderPaymentView order={order} paymentUrl={paymentUrl} />;
}