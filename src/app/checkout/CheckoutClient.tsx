"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { getWooStoreRequestHeaders, useCart } from "@/context/cart-context";

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

function isCustomerPaidShippingMethod(method: CheckoutShippingMethod) {
  const label = `${method.title} ${method.description}`.toLowerCase();

  return method.total === 0 && (label.includes("nacional") || label.includes("argentina")) && !label.includes("corrientes");
}

function getShippingDescription(method: CheckoutShippingMethod) {
  if (isCustomerPaidShippingMethod(method)) {
    return "A cargo del cliente. Coordinamos el costo según destino antes del despacho.";
  }

  return method.description || "Disponible para tu compra";
}

function getShippingPriceLabel(method: CheckoutShippingMethod) {
  if (isCustomerPaidShippingMethod(method)) return "A cargo del cliente";
  if (method.total === 0) return "Gratis";

  return `AR$ ${method.total.toLocaleString("es-AR")}`;
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

function hasEnoughPhoneDigits(value: string) {
  return onlyDigits(value).length >= 10 || "Ingresá un WhatsApp válido con código de área.";
}

type CheckoutCartItem = ReturnType<typeof useCart>["items"][number];

function isDiscountPaymentMethod(paymentMethodId: string, gatewayIds?: string[]) {
  if (!paymentMethodId) return false;
  if (gatewayIds?.length) return gatewayIds.includes(paymentMethodId);
  return ["bacs", "cod", "cheque"].includes(paymentMethodId);
}

function isManualPaymentMethod(paymentMethodId: string) {
  return ["bacs", "cod", "cheque"].includes(paymentMethodId);
}

function getCheckoutUnitPrice(item: CheckoutCartItem, paymentMethodId: string) {
  const prices = item.product.prices;
  if (isDiscountPaymentMethod(paymentMethodId, prices?.discountGatewayIds) && prices?.discount) {
    return prices.discount;
  }
  return prices?.list ?? prices?.base ?? item.product.price;
}

function getStockIssues(items: CheckoutCartItem[]) {
  return items.filter((item) => item.product.stock > 0 && item.product.stock < 999 && item.quantity > item.product.stock);
}

async function getCheckoutErrorMessage(response: Response) {
  const text = await response.text().catch(() => "");
  if (!text) return "No pudimos preparar tu pedido. Revisemos los datos e intentemos otra vez.";

  try {
    const payload = JSON.parse(text) as { message?: string; code?: string; data?: { message?: string } };
    return payload.message ?? payload.data?.message ?? "No pudimos preparar tu pedido. Revisemos los datos e intentemos otra vez.";
  } catch {
    return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220) || "No pudimos preparar tu pedido. Revisemos los datos e intentemos otra vez.";
  }
}

export default function CheckoutClient() {
  const { items, total, refreshCart, updateQuantity } = useCart();
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
  const paymentSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + getCheckoutUnitPrice(item, paymentMethodId) * item.quantity, 0),
    [items, paymentMethodId]
  );
  const paymentDiscount = Math.max(0, total - paymentSubtotal);
  const grandTotal = paymentSubtotal + shipping;

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

    const latestItems = await refreshCart().catch(() => items);

    const stockIssues = getStockIssues(latestItems);
    if (stockIssues.length > 0) {
      await Promise.all(stockIssues.map((item) => updateQuantity(item.id, item.product.stock)));
      await refreshCart().catch(() => items);
      setStatus(`Ajustamos la cantidad disponible de ${stockIssues[0].product.name}. Revisá el resumen y volvé a intentar.`);
      return;
    }

    const headers = getWooStoreRequestHeaders();
    headers.set("Content-Type", "application/json");

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers,
      body: JSON.stringify({
        customer: data,
        items,
        paymentMethodId,
        shippingMethodId,
      }),
    });

    if (!response.ok) {
      const message = await getCheckoutErrorMessage(response);
      if (response.status === 409) {
        await refreshCart().catch(() => items);
        setStatus(`${message} Actualizamos tu carrito; revisá cantidades y volvé a intentar.`);
        return;
      }
      setStatus(message);
      return;
    }

    const payload = await response.json() as {
      message?: string;
      order_id?: number;
      order_key?: string;
      payment_result?: { redirect_url?: string; payment_status?: string };
    };
    const redirectUrl = payload.payment_result?.redirect_url;
    const manualPayment = isManualPaymentMethod(paymentMethodId);

    await refreshCart();

    if (manualPayment && payload.order_id) {
      const params = new URLSearchParams();
      if (payload.order_key) params.set("key", payload.order_key);
      window.location.href = `/orden/pagar/${payload.order_id}${params.toString() ? `?${params.toString()}` : ""}`;
      return;
    }

    if (redirectUrl) {
      const url = new URL(redirectUrl, window.location.origin);
      if (url.pathname.includes("/finalizar-comprar/order-pay/")) {
        url.protocol = window.location.protocol;
        url.host = window.location.host;
        if (paymentMethodId) url.searchParams.set("fimy_payment_method", paymentMethodId);
      }
      window.location.href = url.toString();
      return;
    }

    if (payload.order_id) {
      const params = new URLSearchParams();
      params.set("pay_for_order", "true");
      if (paymentMethodId) params.set("fimy_payment_method", paymentMethodId);
      if (payload.order_key) params.set("key", payload.order_key);
      window.location.href = `/finalizar-comprar/order-pay/${payload.order_id}/${params.toString() ? `?${params.toString()}` : ""}`;
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
                    {...register("name", {
                      required: "Ingresá tu nombre y apellido.",
                      minLength: { value: 3, message: "Ingresá al menos 3 caracteres." },
                    })}
                    className="mt-2 w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none ring-1 ring-transparent focus:ring-primary/35"
                    type="text"
                    autoComplete="name"
                    placeholder="Nombre completo"
                  />
                  {errors.name?.message && <span className="mt-1 block text-xs text-error">{errors.name.message}</span>}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-on-surface">
                    Email
                    <input
                      {...register("email", {
                          required: "Ingresá tu email.",
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Ingresá un email válido." },
                        })}
                      className="mt-2 w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none ring-1 ring-transparent focus:ring-primary/35"
                      type="email"
                      autoComplete="email"
                      placeholder="tu@email.com"
                    />
                    {errors.email?.message && <span className="mt-1 block text-xs text-error">{errors.email.message}</span>}
                  </label>
                  <label className="text-sm font-semibold text-on-surface">
                    WhatsApp
                    <input
                      {...register("phone", {
                          required: "Ingresá tu WhatsApp.",
                          validate: hasEnoughPhoneDigits,
                          onChange: maskPhone,
                        })}
                      className="mt-2 w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none ring-1 ring-transparent focus:ring-primary/35"
                      type="tel"
                      inputMode="numeric"
                      maxLength={12}
                      autoComplete="tel"
                      placeholder="11 1234-5678"
                    />
                    {errors.phone?.message && <span className="mt-1 block text-xs text-error">{errors.phone.message}</span>}
                  </label>
                </div>

                <label className="text-sm font-semibold text-on-surface">
                  Direccion
                  <input
                    {...register("address", {
                    required: "Ingresá la dirección de entrega.",
                    minLength: { value: 5, message: "Agregá calle y número." },
                  })}
                    className="mt-2 w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none ring-1 ring-transparent focus:ring-primary/35"
                    type="text"
                    autoComplete="street-address"
                    placeholder="Calle, numero, piso/depto"
                  />
                  {errors.address?.message && <span className="mt-1 block text-xs text-error">{errors.address.message}</span>}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-on-surface">
                    Ciudad
                    <input
                      {...register("city", {
                        required: "Ingresá la ciudad.",
                        minLength: { value: 2, message: "Ingresá una ciudad válida." },
                      })}
                      className="mt-2 w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none ring-1 ring-transparent focus:ring-primary/35"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="Ciudad"
                    />
                    {errors.city?.message && <span className="mt-1 block text-xs text-error">{errors.city.message}</span>}
                  </label>
                  <label className="text-sm font-semibold text-on-surface">
                    Código postal
                    <input
                      {...register("postalCode", {
                          required: "Ingresá el código postal.",
                          minLength: { value: 4, message: "Ingresá un CP válido." },
                          onChange: maskPostalCode,
                        })}
                      className="mt-2 w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none ring-1 ring-transparent focus:ring-primary/35"
                      type="text"
                      inputMode="text"
                      maxLength={8}
                      autoComplete="postal-code"
                      placeholder="CP"
                    />
                    {errors.postalCode?.message && <span className="mt-1 block text-xs text-error">{errors.postalCode.message}</span>}
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <fieldset className="rounded-[1.5rem] bg-[#fbf4ea] p-4">
                    <legend className="mb-3 text-sm font-bold text-on-surface">Método de envío</legend>
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
                            <span className="block text-xs text-on-surface-variant">{getShippingDescription(method)}</span>
                            <span className="mt-1 block text-xs font-bold text-secondary">{getShippingPriceLabel(method)}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="rounded-[1.5rem] bg-[#fbf4ea] p-4">
                    <legend className="mb-3 text-sm font-bold text-on-surface">Método de pago</legend>
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
                        AR$ {(getCheckoutUnitPrice(item, paymentMethodId) * item.quantity).toLocaleString("es-AR")}
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
                {paymentDiscount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Bonificación por método de pago</span>
                    <span>- AR$ {paymentDiscount.toLocaleString("es-AR")}</span>
                  </div>
                )}
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
