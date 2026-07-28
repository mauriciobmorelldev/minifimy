import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Información sobre el uso de cookies en Minifimy.",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-24">
      <article className="rounded-[2rem] bg-surface-container-low p-8 shadow-soft sm:p-10">
        <span className="chip bg-white/70">Cookies</span>
        <h1 className="mt-4 font-headline text-4xl font-extrabold text-on-surface">Política de cookies</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-on-surface-variant">
          <p>Minifimy puede usar cookies técnicas para recordar el carrito, mantener sesiones y permitir que la tienda funcione correctamente.</p>
          <p>También podemos usar mediciones anónimas o herramientas similares para entender cómo se navega la web y mejorar la experiencia.</p>
          <p>Podés administrar o borrar cookies desde la configuración de tu navegador. Si desactivás cookies técnicas, algunas funciones de compra podrían no funcionar bien.</p>
          <p>Ante cualquier consulta, escribinos a hola@minifimy.com.</p>
        </div>
      </article>
    </main>
  );
}
