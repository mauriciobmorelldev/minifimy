import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gracias",
  description: "Compra confirmada en MINIFIMY.",
};

export default function ThankYouPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-24">
      <div className="rounded-lg bg-surface-container-low p-10 text-center shadow-soft">
        <h1 className="text-3xl font-semibold text-on-surface font-headline">
          ¡Gracias por tu compra!
        </h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Te enviamos un email con los detalles del pedido.
        </p>
        <Link href="/catalogo" className="btn-primary mt-6 inline-flex">
          Seguir comprando
        </Link>
      </div>
    </main>
  );
}
