import Link from "next/link";

type FooterLink = {
  href: string;
  label: string;
};

interface FooterProps {
  exploreLinks: FooterLink[];
  supportLinks: FooterLink[];
}

const instagramUrl = "https://www.instagram.com/minifimybebe";
const whatsappPhone = "5493794004299";
const whatsappDisplay = "3794 004299";
const whatsappUrl =
  "https://wa.me/" +
  whatsappPhone +
  "?text=" +
  encodeURIComponent("Hola Minifimy! Quiero hacer una consulta.");

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M5.5 19.1 6.4 16A7.4 7.4 0 1 1 9 18.4l-3.5.7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 8.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4-.1.6l-.4.5c.6 1 1.4 1.7 2.5 2.3l.5-.5c.2-.2.4-.2.7-.1l1.3.6c.3.1.4.3.4.6v.5c0 .3-.1.6-.4.7-.6.3-1.5.4-2.7 0-2.7-.8-4.6-2.8-5.3-5.2-.2-.6 0-1.1.2-1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Footer({ exploreLinks, supportLinks }: FooterProps) {
  return (
    <footer className="mt-12 w-full rounded-t-[2rem] bg-surface-container">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 sm:px-8 lg:grid-cols-[1.15fr_0.8fr_0.8fr_1fr] lg:px-12 lg:py-16">
        <div className="flex flex-col gap-5">
          <div className="font-headline text-xl font-bold uppercase tracking-widest text-primary">minifimy</div>
          <p className="max-w-sm text-sm leading-7 text-primary/72">
            Mini ropa, maxi amor. Prendas, regalos y pequeños detalles elegidos con calma para acompañar sus primeras
            veces.
          </p>
          <div className="flex items-center gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-primary shadow-soft transition hover:-translate-y-0.5 hover:bg-white"
              aria-label="Instagram de Minifimy"
            >
              <InstagramIcon />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-primary shadow-soft transition hover:-translate-y-0.5 hover:bg-white"
              aria-label="WhatsApp de Minifimy"
            >
              <WhatsAppIcon />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Explorar</h4>
          <div className="flex flex-col gap-3 text-sm text-primary/72">
            {exploreLinks.map((link) => (
              <Link
                key={link.href + "-" + link.label}
                href={link.href}
                className="transition hover:text-primary hover:underline decoration-secondary underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Soporte</h4>
          <div className="flex flex-col gap-3 text-sm text-primary/72">
            {supportLinks.map((link) => (
              <Link
                key={link.href + "-" + link.label}
                href={link.href}
                className="transition hover:text-primary hover:underline decoration-secondary underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-[1.5rem] bg-white/58 p-5 shadow-soft ring-1 ring-white/70">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Contactanos</h4>
          <div className="space-y-3 text-sm leading-6 text-primary/78">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition hover:text-primary">
              <WhatsAppIcon />
              <span>WhatsApp: {whatsappDisplay}</span>
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition hover:text-primary">
              <InstagramIcon />
              <span>@minifimybebe</span>
            </a>
            <a href="mailto:hola@minifimy.com" className="flex items-center gap-3 transition hover:text-primary">
              <span className="material-symbols-outlined text-xl">mail</span>
              <span>hola@minifimy.com</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-primary/10 px-6 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-primary/62 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Minifimy. Todos los derechos reservados.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legales">
            <Link href="/legales" className="transition hover:text-primary">
              Términos y condiciones
            </Link>
            <Link href="/privacidad" className="transition hover:text-primary">
              Privacidad
            </Link>
            <Link href="/cookies" className="transition hover:text-primary">
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
