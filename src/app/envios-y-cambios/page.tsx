import type { Metadata } from "next";
import Link from "next/link";
import {
  hasApprovedExchangePolicy,
  hasApprovedShippingPolicy,
  storePolicy,
} from "@/lib/store-policy";

export const metadata: Metadata = {
  title: "Envíos y cambios",
  description: "Información de envíos, seguimiento y cambios de MiniFimy.",
};

function Fact({ title, value }: { title: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-[1.25rem] bg-white/78 p-5">
      <h3 className="text-sm font-extrabold text-primary">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-on-surface-variant">{value}</p>
    </div>
  );
}

export default function ShippingAndExchangesPage() {
  const shippingApproved = hasApprovedShippingPolicy();
  const exchangesApproved = hasApprovedExchangePolicy();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-28 sm:px-8">
      <header className="rounded-[2.4rem] bg-[#efe4d0] p-6 shadow-soft sm:p-10">
        <span className="chip bg-white/75">Antes y después de comprar</span>
        <h1 className="mt-5 font-headline text-4xl font-extrabold sm:text-5xl">Envíos y cambios</h1>
        <p className="mt-4 max-w-3xl leading-8 text-on-surface-variant">
          Acá vas a encontrar las condiciones vigentes y aprobadas. Si todavía falta validar un dato, lo indicamos claramente para no prometer plazos o costos incorrectos.
        </p>
      </header>

      <div className="mt-7 grid gap-7 lg:grid-cols-2">
        <section className="rounded-[2rem] bg-surface-container-low p-6 shadow-soft sm:p-8">
          <span className="material-symbols-outlined text-3xl text-primary">local_shipping</span>
          <h2 className="mt-4 font-headline text-3xl font-extrabold">Envíos</h2>
          {shippingApproved ? (
            <div className="mt-5 grid gap-3">
              <Fact title="Desde dónde despachamos" value={storePolicy.shipping.origin} />
              <Fact title="Cobertura" value={storePolicy.shipping.coverage} />
              <Fact title="Modalidades y empresas" value={storePolicy.shipping.carriers} />
              <Fact title="Costo" value={storePolicy.shipping.cost} />
              <Fact title="Plazos estimados" value={storePolicy.shipping.timing} />
              <Fact title="Seguimiento" value={storePolicy.shipping.tracking} />
            </div>
          ) : (
            <p className="mt-5 rounded-[1.4rem] bg-white/80 p-5 text-sm leading-7 text-on-surface-variant">
              Las modalidades, costos y plazos están pendientes de aprobación comercial. Consultanos tu localidad antes de finalizar la compra.
            </p>
          )}
        </section>

        <section className="rounded-[2rem] bg-surface-container-low p-6 shadow-soft sm:p-8">
          <span className="material-symbols-outlined text-3xl text-primary">verified_user</span>
          <h2 className="mt-4 font-headline text-3xl font-extrabold">Cambios</h2>
          {exchangesApproved ? (
            <div className="mt-5 grid gap-3">
              <Fact title="Plazo" value={storePolicy.exchanges.window} />
              <Fact title="Condiciones de la prenda" value={storePolicy.exchanges.conditions} />
              <Fact title="Exclusiones" value={storePolicy.exchanges.exclusions} />
              <Fact title="Costo del cambio" value={storePolicy.exchanges.cost} />
            </div>
          ) : (
            <p className="mt-5 rounded-[1.4rem] bg-white/80 p-5 text-sm leading-7 text-on-surface-variant">
              El plazo, las condiciones y los costos de cambio están pendientes de aprobación. Escribinos antes de comprar si necesitás confirmar una condición particular.
            </p>
          )}
        </section>
      </div>

      <div className="mt-7">
        <Link href="/contacto" className="btn-primary rounded-full px-6">Hacer una consulta</Link>
      </div>
    </main>
  );
}
