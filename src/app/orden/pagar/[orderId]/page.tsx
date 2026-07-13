import type { Metadata } from "next";
import { redirect } from "next/navigation";
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

function isManualPaymentMethod(paymentMethodId?: string) {
  return ["bacs", "cod", "cheque"].includes(paymentMethodId ?? "");
}

function getFrontendOrigin() {
  const frontendUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!frontendUrl) return undefined;

  try {
    return new URL(frontendUrl).origin;
  } catch {
    return undefined;
  }
}

function getStoreOrigin() {
  const storeUrl = process.env.WOOCOMMERCE_URL ?? process.env.WORDPRESS_URL;
  if (!storeUrl) return undefined;

  try {
    return new URL(storeUrl).origin;
  } catch {
    return undefined;
  }
}

function getPaymentUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;

    const storeOrigin = getStoreOrigin();
    const frontendOrigin = getFrontendOrigin();
    if (storeOrigin && frontendOrigin && url.origin === storeOrigin) {
      return `${frontendOrigin}${url.pathname}${url.search}${url.hash}`;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

export default async function OrderPayPage({ params, searchParams }: OrderPayPageProps) {
  const { orderId } = await params;
  const query = await searchParams;
  const order = await getStoreOrderForPayment(orderId, query.key);
  const paymentUrl = getPaymentUrl(query.pay) ?? order?.paymentUrl;

  if (paymentUrl && !isManualPaymentMethod(order?.paymentMethod)) {
    redirect(paymentUrl);
  }

  return <OrderPaymentView order={order} paymentUrl={paymentUrl} />;
}