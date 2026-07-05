import Image from "next/image";

export default function Loading() {
  return (
    <main className="loading-world flex min-h-screen items-center justify-center px-6 py-16" aria-label="Cargando Minifimy">
      <section className="relative flex w-full max-w-md flex-col items-center text-center">
        <div className="loader-logo-glow relative flex h-36 w-36 items-center justify-center rounded-full bg-white/78 shadow-lift">
          <Image src="/brand/logo.svg" alt="Minifimy" width={170} height={58} priority className="h-auto w-32" />
        </div>
        <div className="mt-8 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/80 shadow-inner">
          <div className="loader-progress h-full rounded-full bg-primary" />
        </div>
      </section>
    </main>
  );
}
