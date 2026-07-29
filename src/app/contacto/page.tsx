import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribinos por WhatsApp, Instagram o email.",
};

const whatsappUrl = "https://wa.me/5493794004299?text=%C2%A1Hola%20MiniFimy!%20Quiero%20hacer%20una%20consulta.";

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-24">
      <div className="rounded-[2rem] bg-surface-container-low p-8 shadow-soft sm:p-10">
        <span className="chip bg-white/70">Contactanos</span>
        <h1 className="mt-4 font-headline text-4xl font-extrabold text-on-surface">Estamos cerquita para ayudarte.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">
          Escribinos por consultas de talles, envíos, regalos o seguimiento de tu pedido. Te respondemos con calma y cariño.
        </p>
        <div className="mt-8 grid gap-4 text-sm text-on-surface-variant sm:grid-cols-2">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="rounded-[1.25rem] bg-white/72 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
            <strong className="block text-primary">WhatsApp</strong>
            <span>3794 004299</span>
          </a>
          <a href="https://www.instagram.com/minifimybebe" target="_blank" rel="noopener noreferrer" className="rounded-[1.25rem] bg-white/72 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
            <strong className="block text-primary">Instagram</strong>
            <span>@minifimybebe</span>
          </a>
          <a href="mailto:hola@minifimy.com" className="rounded-[1.25rem] bg-white/72 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
            <strong className="block text-primary">Email</strong>
            <span>hola@minifimy.com</span>
          </a>
          <div className="rounded-[1.25rem] bg-white/72 p-5 shadow-soft">
            <strong className="block text-primary">Horarios</strong>
            <span>Lunes a viernes de 9 a 18 hs.</span>
          </div>
        </div>
      </div>
    </main>
  );
}
