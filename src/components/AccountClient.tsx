"use client";

import { useEffect, useState, type FormEvent } from "react";

interface SessionData {
  token: string;
  email: string;
  name?: string;
}

interface OrderSummary {
  id: number;
  status: string;
  total: string;
  currency: string;
  dateCreated?: string;
}

const SESSION_KEY = "minifimy_wp_session";

export function AccountClient() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [status, setStatus] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(SESSION_KEY);
    if (saved) setSession(JSON.parse(saved) as SessionData);
  }, []);

  useEffect(() => {
    if (!session?.token) return;

    setLoadingOrders(true);
    fetch("/api/account/orders", { headers: { Authorization: `Bearer ${session.token}` } })
      .then((response) => response.json())
      .then((payload: { orders?: OrderSummary[]; message?: string }) => {
        setOrders(payload.orders ?? []);
        if (payload.message && !payload.orders) setStatus(payload.message);
      })
      .catch(() => setStatus("No pudimos cargar tus pedidos desde Fimy."))
      .finally(() => setLoadingOrders(false));
  }, [session]);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("Validando con Fimy...");

    const response = await fetch("/api/account/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const payload = await response.json().catch(() => ({})) as { message?: string; session?: SessionData };

    if (!response.ok || !payload.session) {
      setStatus(payload.message ?? "No pudimos iniciar sesion.");
      return;
    }

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(payload.session));
    setSession(payload.session);
    setStatus("Listo, sesion validada por Fimy.");
  };

  const submitRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("Creando cuenta en Fimy...");

    const response = await fetch("/api/account/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
      }),
    });
    const payload = await response.json().catch(() => ({})) as { message?: string };
    setStatus(payload.message ?? (response.ok ? "Cuenta creada." : "No pudimos crear la cuenta."));
    if (response.ok) setMode("login");
  };

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setOrders([]);
    setStatus("Sesion cerrada en este dispositivo.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] bg-[#efe4d0] p-6 shadow-soft md:p-9">
        <span className="inline-flex rounded-full bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary shadow-soft">
          Cuenta Minifimy
        </span>
        <h1 className="mt-5 font-headline text-[2.25rem] font-extrabold leading-tight text-on-surface md:text-5xl">
          Todo se ve en Next, todo se guarda en Fimy.
        </h1>
        <p className="mt-4 text-sm leading-7 text-on-surface-variant md:text-base">
          Registro, login y pedidos se consultan contra Fimy/Fimy. No duplicamos clientes en Next.
        </p>

        {session ? (
          <div className="mt-7 rounded-[1.5rem] bg-white/78 p-5 shadow-soft">
            <p className="text-sm font-bold text-primary">Sesion activa</p>
            <p className="mt-1 text-lg font-extrabold text-on-surface">{session.name || session.email}</p>
            <p className="text-sm text-on-surface-variant">{session.email}</p>
            <button type="button" onClick={logout} className="mt-5 rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary">
              Cerrar sesion
            </button>
          </div>
        ) : (
          <div className="mt-7 flex gap-2 rounded-full bg-white/60 p-1">
            <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-full px-4 py-3 text-sm font-bold ${mode === "login" ? "bg-primary text-on-primary" : "text-primary"}`}>
              Iniciar sesion
            </button>
            <button type="button" onClick={() => setMode("register")} className={`flex-1 rounded-full px-4 py-3 text-sm font-bold ${mode === "register" ? "bg-primary text-on-primary" : "text-primary"}`}>
              Crear cuenta
            </button>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] bg-white/82 p-5 shadow-soft md:p-8">
        {!session && mode === "login" && (
          <form onSubmit={submitLogin} className="space-y-4">
            <h2 className="font-headline text-2xl font-extrabold text-on-surface">Entrar con Fimy</h2>
            <input name="email" type="email" required placeholder="Email" className="w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none" />
            <input name="password" type="password" required placeholder="Clave" className="w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none" />
            <button className="w-full rounded-full bg-primary py-3.5 font-bold text-on-primary">Iniciar sesion</button>
          </form>
        )}

        {!session && mode === "register" && (
          <form onSubmit={submitRegister} className="space-y-4">
            <h2 className="font-headline text-2xl font-extrabold text-on-surface">Crear cuenta Fimy</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="firstName" required placeholder="Nombre" className="rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none" />
              <input name="lastName" placeholder="Apellido" className="rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none" />
            </div>
            <input name="email" type="email" required placeholder="Email" className="w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none" />
            <input name="phone" type="tel" placeholder="WhatsApp" className="w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none" />
            <input name="password" type="password" required minLength={8} placeholder="Clave" className="w-full rounded-full bg-[#fbf4ea] px-5 py-3.5 outline-none" />
            <button className="w-full rounded-full bg-primary py-3.5 font-bold text-on-primary">Crear cuenta</button>
          </form>
        )}

        {session && (
          <div>
            <h2 className="font-headline text-2xl font-extrabold text-on-surface">Tus pedidos Fimy</h2>
            {loadingOrders ? <p className="mt-4 text-sm text-on-surface-variant">Cargando pedidos...</p> : null}
            <div className="mt-5 space-y-3">
              {orders.map((order) => (
                <article key={order.id} className="rounded-[1.3rem] bg-[#fbf4ea] p-4">
                  <p className="text-sm font-extrabold text-on-surface">Pedido #{order.id}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-primary">{order.status}</p>
                  <p className="mt-2 font-bold text-secondary">{order.currency} {order.total}</p>
                </article>
              ))}
              {!loadingOrders && orders.length === 0 && <p className="text-sm text-on-surface-variant">Todavia no hay pedidos para esta cuenta.</p>}
            </div>
          </div>
        )}

        {status && <p className="mt-5 rounded-[1.2rem] bg-[#f7efe3] p-4 text-sm font-semibold text-primary">{status}</p>}
      </section>
    </div>
  );
}
