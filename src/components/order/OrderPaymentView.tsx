import Link from "next/link";
import type { StoreManualPaymentDetails, StoreOrderPaymentDetails } from "@/lib/woocommerce";

interface OrderPaymentViewProps {
  order: StoreOrderPaymentDetails | null;
  paymentUrl?: string;
}

function getManualPaymentRows(details?: StoreManualPaymentDetails) {
  if (!details) return [];

  return [
    { label: "Alias", value: details.alias },
    { label: "CBU / CVU", value: details.cbu },
    { label: "Titular", value: details.holder },
    { label: "Banco", value: details.bank },
    { label: "Tipo de cuenta", value: details.accountType },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));
}

function getWhatsAppHref(phone?: string, orderId?: number) {
  const digits = phone?.replace(/\D/g, "");
  if (!digits) return undefined;

  const text = encodeURIComponent(`Hola Minifimy, te envío el comprobante del pedido #${orderId}.`);
  return `https://wa.me/${digits}?text=${text}`;
}

export function OrderPaymentView({ order, paymentUrl }: OrderPaymentViewProps) {
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

  const isManualPayment = ["bacs", "cod", "cheque"].includes(order.paymentMethod);
  const hasGatewayLink = Boolean(paymentUrl);
  const manualRows = getManualPaymentRows(order.manualPayment);
  const whatsappHref = getWhatsAppHref(order.manualPayment?.whatsapp, order.id);
  const paymentHelpText = isManualPayment
    ? order.manualPayment?.note || order.paymentInstructions || "Cuando termines el pago, envianos el comprobante con tu número de pedido."
    : hasGatewayLink
      ? "Tu pago se abre en el proveedor elegido para completarlo de forma segura."
      : "Te vamos a acompañar para completar el pago y preparar tu pedido.";

  return (
    <main className="mobile-soft-page mx-auto min-h-screen max-w-5xl px-5 pb-20 pt-28 md:px-6">
      <section className="overflow-hidden rounded-[2rem] bg-[#efe4d0] p-6 shadow-soft md:p-10">
        <span className="inline-flex rounded-full bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary shadow-soft">
          Pedido #{order.id}
        </span>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.75fr]">
          <div>
            <h1 className="font-headline text-[2.25rem] font-extrabold leading-tight text-on-surface md:text-5xl">
              {isManualPayment ? "Tu pedido quedó reservado." : "Ya tenemos tu pedido."}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base">
              {isManualPayment
                ? "Te dejamos los datos para completar el pago. En Fimy lo vemos como pendiente hasta confirmar el comprobante."
                : "Revisá el resumen y continuá con el pago cuando esté todo bien."}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white/78 p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Estado</p>
            <p className="mt-2 text-2xl font-extrabold text-on-surface">{isManualPayment ? "Pendiente de pago" : order.status}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">Método</p>
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
          <div className="mt-5 space-y-4 rounded-[1.4rem] bg-[#f7efe3] p-4 text-sm leading-6 text-primary">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5 text-primary">payments</span>
              <div>
                <p className="font-bold text-on-surface">{isManualPayment ? "Pago manual pendiente." : "Continuá con el pago."}</p>
                <p>{paymentHelpText}</p>
              </div>
            </div>

            <div className="rounded-[1.1rem] bg-white/72 p-4 text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Método elegido</p>
              <p className="mt-1 font-headline text-xl font-extrabold">{order.paymentMethodTitle}</p>
              {isManualPayment && manualRows.length > 0 && (
                <dl className="mt-4 space-y-2">
                  {manualRows.map((row) => (
                    <div key={row.label} className="rounded-2xl bg-[#fbf4ea] px-4 py-3">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{row.label}</dt>
                      <dd className="mt-1 break-words font-bold text-on-surface">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {isManualPayment && manualRows.length === 0 && (
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                  Todavía no hay datos bancarios cargados. Escribinos y te pasamos cómo completar el pago.
                </p>
              )}
            </div>
          </div>
          {isManualPayment && whatsappHref ? (
            <a href={whatsappHref} className="mt-4 flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-soft">
              Enviar comprobante
            </a>
          ) : (
            <Link href={`/gracias?order=${order.id}`} className="mt-4 flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-primary shadow-soft">
              Ver confirmación
            </Link>
          )}
        </aside>
      </section>
    </main>
  );
}
