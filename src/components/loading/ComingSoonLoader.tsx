import Image from "next/image";

type ComingSoonLoaderProps = {
  progress: 70 | 99;
};

export function ComingSoonLoader({ progress }: ComingSoonLoaderProps) {
  return (
    <main className="pattern-surface flex min-h-[calc(100vh-5rem)] items-center px-6 py-24">
      <section className="mx-auto grid w-full max-w-5xl items-center gap-10 rounded-lg bg-surface-container-low/95 p-8 shadow-lift md:grid-cols-[1fr_0.8fr] md:p-12">
        <div className="space-y-7">
          <span className="chip">MINIFIMY</span>
          <div className="space-y-4">
            <h1 className="font-headline text-4xl font-bold leading-tight text-on-surface md:text-5xl">
              Pagina cargando, proximamente
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
              Estamos preparando este espacio con el mismo cuidado suave de cada detalle
              MINIFIMY.
            </p>
          </div>

          <div className="space-y-3" aria-label={`Carga al ${progress}%`}>
            <div className="flex items-center justify-between text-sm font-bold text-on-surface">
              <span>Progreso</span>
              <span>{progress}%</span>
            </div>
            <div
              className="h-5 overflow-hidden rounded-full border border-outline-variant bg-surface-container-highest shadow-inner"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="loader-progress h-full rounded-full bg-primary shadow-lg shadow-primary/20 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <span>Preparando</span>
              <span className="loading-dot" />
              <span className="loading-dot loading-dot-delay-1" />
              <span className="loading-dot loading-dot-delay-2" />
            </div>
          </div>
        </div>

        <div className="loader-logo-glow relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center rounded-lg bg-white/70 p-8 shadow-soft md:max-w-sm">
          <div className="absolute inset-4 rounded-lg border border-dashed border-outline-variant" />
          <Image
            src="/brand/logo.svg"
            alt="Logo MINIFIMY"
            width={180}
            height={180}
            className="relative fimy-float h-auto w-36 md:w-44"
            priority
          />
        </div>
      </section>
    </main>
  );
}
