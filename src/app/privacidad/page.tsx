import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo cuidamos los datos personales en Minifimy.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-24">
      <article className="rounded-[2rem] bg-surface-container-low p-8 shadow-soft sm:p-10">
        <span className="chip bg-white/70">Privacidad</span>
        <h1 className="mt-4 font-headline text-4xl font-extrabold text-on-surface">Política de privacidad</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-on-surface-variant">
          <p>Usamos tus datos únicamente para procesar compras, coordinar entregas, responder consultas y mejorar la experiencia de la tienda.</p>
          <p>Podemos solicitar nombre, contacto, dirección de envío, datos de facturación y detalles del pedido. Los pagos se procesan mediante los medios habilitados en la tienda.</p>
          <p>No vendemos tus datos personales. Solo los compartimos con servicios necesarios para operar la compra, como pagos, envíos o herramientas técnicas.</p>
          <p>Podés solicitar revisión, actualización o eliminación de tus datos escribiendo a hola@minifimy.com.</p>
        </div>
      </article>
    </main>
  );
}
