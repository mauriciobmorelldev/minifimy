import Image from "next/image";
import { CampaignOpeningCountdown } from "@/components/CampaignOpeningCountdown";

const openingDate = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function CampaignWaitingScreen({ opensAt, remainingMs, invalidPassword }: { opensAt: number; remainingMs: number; invalidPassword: boolean }) {
  return (
    <main className="relative isolate grid min-h-[100svh] items-center overflow-hidden bg-[#241415] text-[#fff2ec] md:grid-cols-[1.1fr_0.9fr]">
      <div className="mx-auto grid w-full max-w-xl gap-6 px-6 py-10 sm:px-10 md:gap-8">
        <Image src="/brand/logo.svg" alt="MiniFimy" width={132} height={70} className="h-auto w-24 brightness-0 invert sm:w-28" preload />
        <div>
          <h1 className="font-headline text-[clamp(3.5rem,10vw,7.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.075em] text-[#fff2ec]">
            Black <span className="-ml-[0.12em] mt-[0.11em] block w-fit bg-[#790627] px-[0.22em] pb-[0.1em] pt-[0.05em] italic [clip-path:polygon(5%_0,100%_0,95%_100%,0_100%)]">Friday</span>
          </h1>
          <p className="mt-4 text-sm font-semibold !text-[#f4c9c7] sm:text-base">
            La tienda abre el <time dateTime={new Date(opensAt).toISOString()}>{openingDate.format(opensAt)}</time> (hora argentina).
          </p>
        </div>

        <CampaignOpeningCountdown remainingMs={remainingMs} />

        <details open={invalidPassword || undefined} className="group max-w-sm rounded-[0.85rem] border border-[#fff2ec]/20 bg-[#2f181d]">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 text-sm font-bold [&::-webkit-details-marker]:hidden">
            Acceso del equipo <span aria-hidden="true" className="group-open:rotate-45">+</span>
          </summary>
          <form action="/api/preview" method="post" className="grid gap-2 border-t border-[#fff2ec]/20 p-4">
            <label htmlFor="preview-password" className="text-sm font-semibold">Contraseña</label>
            <input
              id="preview-password"
              name="password"
              type="password"
              maxLength={256}
              required
              autoComplete="current-password"
              className="min-h-11 rounded-[0.65rem] bg-[#fff2ec] px-3 text-base text-[#241415]"
            />
            {invalidPassword && <p role="alert" className="text-sm !text-[#f4c9c7]">La contraseña es incorrecta.</p>}
            <button type="submit" className="min-h-11 rounded-[0.65rem] bg-[#790627] px-4 text-sm font-extrabold text-white hover:bg-[#931034]">
              Entrar a la tienda
            </button>
          </form>
        </details>
      </div>
      <div className="relative hidden h-full min-h-[620px] overflow-hidden rounded-l-[18%] border-l-[3px] border-[#a93a50] md:block">
        <Image src="/brand/black-friday/catalogo-nino.jpg" alt="" fill sizes="45vw" className="object-cover object-center" />
      </div>
    </main>
  );
}
