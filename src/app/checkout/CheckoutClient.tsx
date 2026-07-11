"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "@/context/cart-context";

interface CheckoutFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

interface CheckoutPaymentMethod {
  id: string;
  title: string;
  description: string;
}

interface CheckoutShippingMethod {
  id: string;
  title: string;
  description: string;
  total: number;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)}-${digits.slice(6)}`;
}

function formatPostalCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

export default function CheckoutClient() {
  const { items, total, clearCart } = useCart();
  const [status, setStatus] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<CheckoutPaymentMethod[]>([]);
  const [shippingMethods, setShippingMethods] = useState<CheckoutShippingMethod[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [shippingMethodId, setShippingMethodId] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CheckoutFormValues>();

  useEffect(() => {
    let active = true;

    fetch("/api/checkout")
      .then((response) => response.json())
      .then((payload: { paymentMethods?: CheckoutPaymentMethod[]; shippingMethods?: CheckoutShippingMethod[] }) => {
        if (!active) return;

        const nextPaymentMethods = payload.paymentMethods ?? [];
        const nextShippingMethods = payload.shippingMethods ?? [];
        setPaymentMethods(nextPaymentMethods);
        setShippingMethods(nextShippingMethods);
        setPaymentMethodId((current) => current || nextPaymentMethods[0]?.id || "");
        setShippingMethodId((current) => current || nextShippingMethods[0]?.id || "");

        if (nextPaymentMethods.length === 0 || nextShippingMethods.length === 0) {
          setStatus("Todavia no encontramos opciones disponibles para completar la compra.");
        }
      })
      .catch(() => {
        if (active) setStatus("No pudimos cargar las opciones de compra. Probemos de nuevo en un ratito.");
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedShippingMethod = useMemo(
    () => shippingMethods.find((method) => method.id === shippingMethodId),
    [shippingMethodId, shippingMethods]
  );
  const shipping = selectedShippingMethod?.total ?? 0;
  const grandTotal = total + shipping;

  const maskPhone = (event: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(event.target.value);
    event.target.value = formatted;
    setValue("phone", formatted, { shouldValidate: true });
  };

  const maskPostalCode = (event: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostalCode(event.target.value);
    event.target.value = formatted;
    setValue("postalCode", formatted, { shouldValidate: true });
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    setStatus("Estamos preparando tu pedido...");

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: data,
        items,
        paymentMethodId,
        shippingMethodId,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({})) as { message?: string };
      setStatus(payload.message ?? "No pudimos preparar tu pedido. Revisemos los datos e intentemos otra vez.");
      return;
    }

    const payload = await response.json() as { message?: string; paymentUrl?: string; orderId?: number; orderKey?: string };
    if (payload.orderId) {
      clearCart();
      const params = new URLSearchParams();
      if (payload.orderKey) params.set("key", payload.orderKey);
      if (payload.paymentUrl) params.set("pay", payload.paymentUrl);
      window.location.href = `/orden/pagar/${payload.orderId}${params.toString() ? `?${params.toString()}` : ""}`;
      return;
    }

    window.location.href = "/gracias";
  };

  return (
    <main className="mobile-soft-page relative overflow-hidden bg-[#fff8ef] px-4 pb-16 pt-28 md:px-6 md:pb-20">
      <div className="pointer-events-none absolute inset-0 opacity-[0.055]">
        <Image src="/brand/patterns/pattern-01.png" alt="" fill sizes="100vw" className="object-cover" />
      </div>

      <section className="relative mx-auto max-w-6xl">
        <header className="mb-8 rounded-[1.8rem] bg-[#efe4d0] px-4 py-6 shadow-soft md:rounded-[2.4rem] md:px-10 md:py-8">
          <span className="inline-flex rounded-full bg-white/72 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary shadow-soft">
            Ultimo pasito
          </span>
          <h1 className="mt-5 font-headline text-[2.15rem] font-extrabold leading-tight text-on-surface md:text-6xl">
            Dejamos todo listo para que llegue a casa.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-on-surface-variant md:text-base md:leading-8">
Vamos a preparar tu pedido con cuidado y dejar todo listo para el siguiente paso.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="rounded-[2rem] bg-white/78 p-10 text-center shadow-soft">
            <h2 className="font-headline text-3xl font-extrabold text-on-surface">Tu carrito esta vacio.</h2>
            <p className="mt-3 text-on-surface-variant">Primero elegi una prenda o regalo para avanzar al checkout.</p>
            <Link href="/catalogo" className="mt-6 inline-flex rounded-full bg-primary px-7 py-3 font-bold text-on-primary shadow-soft">
              Volver al catalogo
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-[1.7rem] bg-white/78 p-4 shadow-soft md:rounded-[2rem] md:p-8"
            >
              <div className="mb-7 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div>
                  <h2 className="font-headline text-xl font-extrabold text-on-surface md:text-2xl">Datos de entrega</h2>
                  <p className="text-sm text-on-surface-variant">Solo pedimos lo necesario para crear la orden.</p>
                </div>
              </div>

              <div className="grid gap-4">
                <label className="text-sm font-semibold text-on-surface">
                  Nombre y apellido
                  <input
                    {...register("name", { required: true })}
                    className="mt-2 w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none ring-1 ring-transparent focus:ring-primary/35"
                    type="text"
                    autoComplete="name"
                    placeholder="Nombre completo"
                  />
                  {errors.name && <span className="mt-1 block text-xs text-error">Campo requerido</span>}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-on-surface">
                    Email
                    <input
                      {...register("email", { required: true })}
                      className="mt-2 w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none ring-1 ring-transparent focus:ring-primary/35"
                      type="email"
                      autoComplete="email"
                      placeholder="tu@email.com"
                    />
                    {errors.email && <span className="mt-1 block text-xs text-error">Campo requerido</span>}
                  </label>
                  <label className="text-sm font-semibold text-on-surface">
                    WhatsApp
                    <input
                      {...register("phone", { required: true, onChange: maskPhone })}
                      className="mt-2 w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none ring-1 ring-transparent focus:ring-primary/35"
                      type="tel"
                      inputMode="numeric"
                      maxLength={12}
                      autoComplete="tel"
                      placeholder="11 1234-5678"
                    />
                    {errors.phone && <span className="mt-1 block text-xs text-error">Campo requerido</span>}
                  </label>
                </div>

                <label className="text-sm font-semibold text-on-surface">
                  Direccion
                  <input
                    {...register("address", { required: true })}
                    className="mt-2 w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none ring-1 ring-transparent focus:ring-primary/35"
                    type="text"
                    autoComplete="street-address"
                    placeholder="Calle, numero, piso/depto"
                  />
                  {errors.address && <span className="mt-1 block text-xs text-error">Campo requerido</span>}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-on-surface">
                    Ciudad
                    <input
                      {...register("city", { required: true })}
                      className="mt-2 w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none ring-1 ring-transparent focus:ring-primary/35"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="Ciudad"
                    />
                    {errors.city && <span className="mt-1 block text-xs text-error">Campo requerido</span>}
                  </label>
                  <label className="text-sm font-semibold text-on-surface">
                    Codigo postal
                    <input
                      {...register("postalCode", { required: true, onChange: maskPostalCode })}
                      className="mt-2 w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none ring-1 ring-transparent focus:ring-primary/35"
                      type="text"
                      inputMode="text"
                      maxLength={8}
                      autoComplete="postal-code"
                      placeholder="CP"
                    />
                    {errors.postalCode && <span className="mt-1 block text-xs text-error">Campo requerido</span>}
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <fieldset className="rounded-[1.5rem] bg-[#fbf4ea] p-4">
                    <legend className="mb-3 text-sm font-bold text-on-surface">Metodo de envio</legend>
                    <div className="space-y-2">
                      {shippingMethods.map((method) => (
                        <label key={method.id} className="flex cursor-pointer items-start gap-3 rounded-[1.1rem] bg-white/60 p-3 text-sm">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={shippingMethodId === method.id}
                            onChange={() => setShippingMethodId(method.id)}
                            className="mt-1 text-primary focus:ring-primary/30"
                          />
                          <span>
                            <strong className="block text-on-surface">{method.title}</strong>
                            <span className="block text-xs text-on-surface-variant">{method.description || "Disponible para tu compra"}</span>
                            <span className="mt-1 block text-xs font-bold text-secondary">AR$ {method.total.toLocaleString("es-AR")}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="rounded-[1.5rem] bg-[#fbf4ea] p-4">
                    <legend className="mb-3 text-sm font-bold text-on-surface">Metodo de pago</legend>
                    <div className="space-y-2">
                      {paymentMethods.map((method) => (
                        <label key={method.id} className="flex cursor-pointer items-start gap-3 rounded-[1.1rem] bg-white/60 p-3 text-sm">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethodId === method.id}
                            onChange={() => setPaymentMethodId(method.id)}
                            className="mt-1 text-primary focus:ring-primary/30"
                          />
                          <span>
                            <strong className="block text-on-surface">{method.title}</strong>
                            <span className="block text-xs text-on-surface-variant">{method.description || "Disponible para tu compra"}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <label className="text-sm font-semibold text-on-surface">
                  Nota para preparar tu pedido, opcional
                  <textarea
                    {...register("notes")}
                    className="mt-2 min-h-28 w-full rounded-[1.5rem] bg-[#fbf4ea] px-5 py-4 outline-none ring-1 ring-transparent focus:ring-primary/35"
                    placeholder="Ej: es para regalo, necesitas tarjeta, preferis coordinar horario..."
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !paymentMethodId || !shippingMethodId}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-headline text-base font-bold text-on-primary shadow-soft transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creando orden..." : "Crear orden y pagar"}
                <span className="material-symbols-outlined">payments</span>
              </button>
              {status && <p className="mt-4 rounded-[1.3rem] bg-[#f7efe3] p-4 text-sm leading-6 text-primary">{status}</p>}
            </form>

            <aside className="h-fit rounded-[2rem] bg-white/82 p-6 shadow-lift lg:sticky lg:top-28">
              <div className="flex items-center gap-3">
                <Image src="/brand/illustrations/jirafa.svg" alt="Fimy" width={52} height={74} className="h-16 w-auto opacity-80" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Resumen</span>
                  <h2 className="font-headline text-xl font-extrabold text-on-surface md:text-2xl">Tu pedido</h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-[64px_1fr] gap-3 rounded-[1.4rem] bg-[#fbf4ea] p-3">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={64}
                      height={76}
                      className="h-20 w-16 rounded-[1rem] object-cover"
                    />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-bold leading-tight text-on-surface">{item.product.name}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">Cantidad {item.quantity}</p>
                      {(item.selection?.size || item.selection?.color) && (
                        <p className="mt-1 text-xs text-on-surface-variant">
                          {item.selection?.size ? `Talle ${item.selection.size}` : ""}
                          {item.selection?.color ? ` · ${item.selection.color}` : ""}
                        </p>
                      )}
                      <p className="mt-2 text-sm font-extrabold text-secondary">
                        AR$ {(item.product.price * item.quantity).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-outline-variant/30 pt-5 text-sm text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>AR$ {total.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between">
                  <span>{selectedShippingMethod?.title ?? "Envio"}</span>
                  <span>AR$ {shipping.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex items-baseline justify-between pt-3 font-headline text-xl font-extrabold text-on-surface">
                  <span>Total</span>
                  <span className="text-primary">AR$ {grandTotal.toLocaleString("es-AR")}</span>
                </div>
              </div>

              <p className="mt-5 rounded-[1.4rem] bg-primary/10 p-4 text-xs leading-5 text-primary">
                Tu pedido queda guardado para que podamos prepararlo y acompanarte con el seguimiento.
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
