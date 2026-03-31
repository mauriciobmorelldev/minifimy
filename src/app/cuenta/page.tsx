import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Accedé a tus pedidos y datos personales.",
};

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="rounded-lg bg-surface-container-low p-10 shadow-soft">
        <h1 className="text-3xl font-semibold text-on-surface font-headline">Mi cuenta</h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          Este espacio estará protegido con Auth.js. Próximamente vas a poder ver tus
          pedidos y guardar direcciones.
        </p>
        <Link href="/api/auth/signin" className="btn-primary mt-6 inline-flex">
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}
