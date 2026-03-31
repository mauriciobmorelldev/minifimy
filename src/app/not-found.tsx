import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col items-start gap-4 px-6 py-24">
      <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">404</p>
      <h1 className="text-3xl font-semibold text-on-surface font-headline">
        No encontramos esta página
      </h1>
      <p className="text-sm text-on-surface-variant">
        Parece que el enlace no existe o fue movido.
      </p>
      <Link href="/" className="btn-primary">
        Volver al inicio
      </Link>
    </main>
  );
}
