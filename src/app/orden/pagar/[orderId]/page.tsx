import Link from "next/link";
import type { Metadata } from "next";
import { getStoreOrderForPayment } from "@/lib/woocommerce";

interface OrderPayPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ key?: string; pay?: string }>;
}

export const metadata: Metadata = {
  title: "Pagar pedido",
  description: "Resumen de pedido Minifimy.",
};

function isExternalPaymentUrl(value?: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export default async function OrderPayPage({ params, searchParams }: OrderPayPageProps) {
  const { orderId } = await params;
  const query = await searchParams;
  const order = await getStoreOrderForPayment(orderId, query.key);
  const externalPaymentUrl = isExternalPaymentUrl(query.pay) ? query.pay : undefined;

  if (!order) {
    return (
      <main className="mobile-soft-page mx-auto min-h-screen max-w-4xl px-5 py-28">
        <section className="rounded-[2rem] bg-white/82 p-8 text-center shadow-soft">
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">No encontramos esta orden.</h1>
          <p className="mt-3 text-sm text-on-surface-variant">No pudimos validar este pedido. Si ya compraste, escribinos y te ayudamos.</p>
          <Link href="/checkout" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-on-primary">Volver al checkout</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mobile-soft-page mx-auto min-h-screen max-w-5xl px-5 pb-20 pt-28 md:px-6">
      <section className="overflow-hidden rounded-[2rem] bg-[#efe4d0] p-6 shadow-soft md:p-10">
        <span className="inline-flex rounded-full bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary shadow-soft">
          Pedido #{order.id}
        </span>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.75fr]">
          <div>
            <h1 className="font-headline text-[2.25rem] font-extrabold leading-tight text-on-surface md:text-5xl">
              Ya tenemos tu pedido.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base">
              Revisa el resumen y continua con el pago cuando este todo bien.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white/78 p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Estado</p>
            <p className="mt-2 text-2xl font-extrabold text-on-surface">{order.status}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">Metodo</p>
            <p className="mt-2 font-bold text-on-surface">{order.paymentMethodTitle}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">Total</p>
            <p className="mt-2 font-headline text-3xl font-extrabold text-secondary">{order.currency} {order.total}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[2rem] bg-white/82 p-5 shadow-soft md:p-7">
          <h2 className="font-headline text-2xl font-extrabold text-on-surface">Productos</h2>
          <div className="mt-5 space-y-3">
            {order.items.map((item) => (
              <article key={item.id} className="flex items-center justify-between gap-4 rounded-[1.3rem] bg-[#fbf4ea] p-4">
                <div>
                  <p className="font-bold text-on-surface">{item.name}</p>
                  <p className="text-sm text-on-surface-variant">Cantidad {item.quantity}</p>
                </div>
                <p className="font-bold text-secondary">{order.currency} {item.total}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-[2rem] bg-white/82 p-5 shadow-soft md:p-7">
          <h2 className="font-headline text-2xl font-extrabold text-on-surface">Pago</h2>
          {externalPaymentUrl ? (
            <a href={externalPaymentUrl} className="mt-5 flex w-full items-center justify-center rounded-full bg-primary py-3.5 font-bold text-on-primary shadow-soft">
              Continuar con {order.paymentMethodTitle}
            </a>
          ) : (
            <div className="mt-5 rounded-[1.4rem] bg-[#f7efe3] p-4 text-sm leading-6 text-primary">
              Tu pedido ya quedo reservado. Todavia no pudimos abrir el pago automatico; escribinos y te ayudamos a completarlo.
            </div>
          )}
          <Link href={`/gracias?order=${order.id}`} className="mt-4 flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-primary shadow-soft">
            Ver confirmacion
          </Link>
        </aside>
      </section>
    </main>
  );
}
