import Image from "next/image";

export function SiteLockedScreen() {
  return (
    <main className="locked-site-screen relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <Image
          src="/brand/patterns/pattern-01.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      <section className="relative grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8 text-center lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <Image
              src="/brand/logo.svg"
              alt="Minifimy"
              width={180}
              height={64}
              priority
              className="h-auto w-44"
            />
          </div>

          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary shadow-soft">
              Estamos trabajando para vos
            </span>
            <h1 className="font-headline text-5xl font-extrabold leading-[0.98] text-on-surface sm:text-6xl lg:text-7xl">
              Estamos preparando algo muy suave.
            </h1>
            <p className="mx-auto max-w-xl text-base leading-8 text-on-surface-variant sm:text-lg lg:mx-0">
              Minifimy esta terminando de acomodar cada detalle para que la experiencia se sienta linda, calida y especial desde el primer momento.
            </p>
          </div>

          <div className="mx-auto max-w-md space-y-3 lg:mx-0">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <span>Preparando tienda</span>
              <span>Muy pronto</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/75 shadow-inner">
              <div className="locked-progress h-full rounded-full bg-primary" />
            </div>
          </div>
        </div>

        <div className="locked-card relative mx-auto flex min-h-[360px] w-full max-w-xl items-center justify-center overflow-hidden bg-[#eadfcb]/95 p-8 shadow-lift sm:min-h-[460px]">
          <div className="locked-sun absolute left-10 top-10" />
          <div className="locked-fimi-portrait absolute inset-x-14 top-8 h-64 rounded-full sm:inset-x-20 sm:h-80" />
          <Image
            src="/brand/illustrations/nube.svg"
            alt=""
            width={160}
            height={100}
            className="fimy-drift absolute right-10 top-10 z-20 w-28 opacity-55 sm:w-36"
            priority
          />
          <div className="absolute bottom-10 left-10 z-20 rounded-[1.5rem] bg-white/78 px-5 py-4 text-sm font-semibold leading-6 text-on-surface-variant shadow-soft">
            Gracias por pasar por Minifimy.
          </div>
          <Image
            src="/brand/illustrations/jirafa.svg"
            alt="Fimi, la guia de Minifimy"
            width={260}
            height={380}
            priority
            className="locked-fimi relative z-10 w-60 sm:w-80"
          />
        </div>
      </section>
    </main>
  );
}
