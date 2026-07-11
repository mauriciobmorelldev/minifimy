import type { Metadata } from "next";
import Link from "next/link";
import { getWooStorefrontUrls } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Accede a tu cuenta, pedidos y datos gestionados por WooCommerce.",
};

export default function AccountPage() {
  const woo = getWooStorefrontUrls();

  return (
    <main className="mobile-soft-page relative mx-auto min-h-screen w-full max-w-6xl px-5 pb-20 pt-28 md:px-6">
      <section className="overflow-hidden rounded-[2rem] bg-[#efe4d0] p-6 shadow-soft md:rounded-[2.6rem] md:p-10">
        <span className="inline-flex rounded-full bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary shadow-soft">
          Cuenta Minifimy
        </span>
        <h1 className="mt-5 max-w-3xl font-headline text-[2.3rem] font-extrabold leading-tight text-on-surface md:text-6xl">
          Tu cuenta vive en WooCommerce.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base md:leading-8">
          Inicio de sesion, registro, direcciones, pedidos, cambios de clave y estado de ordenes se gestionan desde WordPress/WooCommerce. Next solo acompana la experiencia visual.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href={woo.login} className="rounded-[1.4rem] bg-primary px-5 py-4 text-sm font-bold text-on-primary shadow-soft transition hover:-translate-y-1">
            Iniciar sesion
          </Link>
          <Link href={woo.register} className="rounded-[1.4rem] bg-white/75 px-5 py-4 text-sm font-bold text-primary shadow-soft transition hover:-translate-y-1">
            Crear cuenta
          </Link>
          <Link href={woo.orders} className="rounded-[1.4rem] bg-white/75 px-5 py-4 text-sm font-bold text-primary shadow-soft transition hover:-translate-y-1">
            Ver pedidos
          </Link>
          <Link href={woo.lostPassword} className="rounded-[1.4rem] bg-white/75 px-5 py-4 text-sm font-bold text-primary shadow-soft transition hover:-translate-y-1">
            Recuperar clave
          </Link>
        </div>
      </section>
    </main>
  );
}
