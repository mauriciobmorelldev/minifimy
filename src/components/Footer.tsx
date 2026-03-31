import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full rounded-t-[2rem] bg-surface-container mt-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-12 py-16 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <div className="text-xl font-bold uppercase tracking-widest text-primary font-headline">
            minifimy
          </div>
          <p className="max-w-xs text-xs uppercase tracking-widest text-primary/70 leading-relaxed">
            © 2024 minifimy. Mini ropa, maxi amor.
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-primary opacity-80 transition-opacity hover:opacity-100">
              public
            </span>
            <span className="material-symbols-outlined text-primary opacity-80 transition-opacity hover:opacity-100">
              chat
            </span>
            <span className="material-symbols-outlined text-primary opacity-80 transition-opacity hover:opacity-100">
              mail
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Explorar</h4>
          <div className="flex flex-col gap-3 text-xs uppercase tracking-widest text-primary/70">
            <Link
              href="/catalogo"
              className="opacity-80 transition-opacity hover:opacity-100 hover:underline decoration-secondary underline-offset-4"
            >
              Catálogo
            </Link>
            <Link
              href="/contacto"
              className="opacity-80 transition-opacity hover:opacity-100 hover:underline decoration-secondary underline-offset-4"
            >
              Guía de talles
            </Link>
            <Link
              href="/contacto"
              className="opacity-80 transition-opacity hover:opacity-100 hover:underline decoration-secondary underline-offset-4"
            >
              Envíos y devoluciones
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Soporte</h4>
          <div className="flex flex-col gap-3 text-xs uppercase tracking-widest text-primary/70">
            <Link
              href="/contacto"
              className="opacity-80 transition-opacity hover:opacity-100 hover:underline decoration-secondary underline-offset-4"
            >
              Contacto
            </Link>
            <Link
              href="/contacto"
              className="opacity-80 transition-opacity hover:opacity-100 hover:underline decoration-secondary underline-offset-4"
            >
              Políticas
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
