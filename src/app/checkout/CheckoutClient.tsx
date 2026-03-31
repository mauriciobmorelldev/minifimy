"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "@/context/cart-context";

interface CheckoutFormValues {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function CheckoutClient() {
  const { items, total } = useCart();
  const [status, setStatus] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>();

  const onSubmit = async (data: CheckoutFormValues) => {
    setStatus("Procesando pago...");

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: data,
        items,
      }),
    });

    if (!response.ok) {
      setStatus("Hubo un problema al procesar tu pago.");
      return;
    }

    const payload = await response.json();
    setStatus(payload.message ?? "Checkout iniciado.");
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-24">
      <div className="grid gap-10 md:grid-cols-[1.2fr,0.8fr]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-lg bg-surface-container-low p-8 shadow-soft"
        >
          <h1 className="text-3xl font-semibold text-on-surface font-headline">Checkout</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Completa tus datos para finalizar la compra.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="text-sm">
              Nombre y apellido
              <input
                {...register("name", { required: true })}
                className="mt-2 w-full rounded-full bg-surface-container-lowest px-4 py-3 focus:ring-2 focus:ring-primary/40"
                type="text"
              />
              {errors.name && <span className="text-xs text-error">Campo requerido</span>}
            </label>
            <label className="text-sm">
              Email
              <input
                {...register("email", { required: true })}
                className="mt-2 w-full rounded-full bg-surface-container-lowest px-4 py-3 focus:ring-2 focus:ring-primary/40"
                type="email"
              />
              {errors.email && <span className="text-xs text-error">Campo requerido</span>}
            </label>
            <label className="text-sm">
              Dirección
              <input
                {...register("address", { required: true })}
                className="mt-2 w-full rounded-full bg-surface-container-lowest px-4 py-3 focus:ring-2 focus:ring-primary/40"
                type="text"
              />
              {errors.address && <span className="text-xs text-error">Campo requerido</span>}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                Ciudad
                <input
                  {...register("city", { required: true })}
                  className="mt-2 w-full rounded-full bg-surface-container-lowest px-4 py-3 focus:ring-2 focus:ring-primary/40"
                  type="text"
                />
                {errors.city && <span className="text-xs text-error">Campo requerido</span>}
              </label>
              <label className="text-sm">
                Código postal
                <input
                  {...register("postalCode", { required: true })}
                  className="mt-2 w-full rounded-full bg-surface-container-lowest px-4 py-3 focus:ring-2 focus:ring-primary/40"
                  type="text"
                />
                {errors.postalCode && <span className="text-xs text-error">Campo requerido</span>}
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary mt-6 w-full">
            Confirmar pago
          </button>
          {status && <p className="mt-4 text-sm text-on-surface-variant">{status}</p>}
        </form>

        <aside className="rounded-lg bg-surface-container-low p-8 shadow-soft">
          <h2 className="text-xl font-semibold text-on-surface font-headline">Resumen</h2>
          <div className="mt-4 space-y-2 text-sm text-on-surface-variant">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between">
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>
                  AR$ {(item.product.price * item.quantity).toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-primary">AR$ {total.toLocaleString("es-AR")}</span>
          </div>
          <p className="mt-4 text-xs text-on-surface-variant">
            El pago se simula con Stripe en modo prueba. Configurá tus llaves en variables
            de entorno.
          </p>
        </aside>
      </div>
    </main>
  );
}
