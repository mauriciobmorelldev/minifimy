import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribinos para consultas o cambios.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-24">
      <div className="rounded-lg bg-surface-container-low p-10 shadow-soft">
        <h1 className="text-3xl font-semibold text-on-surface font-headline">Contacto</h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Estamos para ayudarte. Escribinos y te respondemos a la brevedad.
        </p>
        <div className="mt-6 grid gap-4 text-sm text-on-surface-variant">
          <p>Mail: hola@minifimy.com</p>
          <p>WhatsApp: +54 11 0000 0000</p>
          <p>Horarios: lunes a viernes de 9 a 18 hs.</p>
        </div>
      </div>
    </main>
  );
}
