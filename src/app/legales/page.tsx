import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Condiciones generales de compra en Minifimy.",
};

export default function LegalPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-24">
      <article className="rounded-[2rem] bg-surface-container-low p-8 shadow-soft sm:p-10">
        <span className="chip bg-white/70">Legales</span>
        <h1 className="mt-4 font-headline text-4xl font-extrabold text-on-surface">Términos y condiciones</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-on-surface-variant">
          <p>Al comprar en Minifimy aceptás las condiciones de compra, pago, envío y cambios vigentes al momento de realizar tu pedido.</p>
          <p>Los productos, precios y disponibilidad pueden actualizarse sin previo aviso. Si una orden necesita revisión, nos comunicaremos por los datos cargados en la compra.</p>
          <p>Las compras quedan confirmadas cuando el pago se acredita o cuando Minifimy valida manualmente el comprobante correspondiente.</p>
          <p>Para consultas, cambios o seguimiento de pedidos podés escribirnos por WhatsApp al 3794 004299 o por Instagram a @minifimybebe.</p>
        </div>
      </article>
    </main>
  );
}
