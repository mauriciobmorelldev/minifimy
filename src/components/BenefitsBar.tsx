const benefits = [
  { icon: "credit_card", title: "3 cuotas sin interés" },
  { icon: "local_shipping", title: "Envíos a todo el país" },
  { icon: "support_agent", title: "Atención personalizada" },
];

export function BenefitsBar() {
  return (
    <section className="bg-primary px-5 py-4 text-on-primary shadow-sm sm:px-8 lg:px-10" aria-label="Beneficios de comprar en MiniFimy">
      <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-3 sm:gap-0">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="flex items-center justify-center gap-3 px-3 text-center sm:border-r sm:border-white/20 sm:last:border-r-0"
          >
            <span className="material-symbols-outlined text-2xl text-[#f2d79d]" aria-hidden="true">
              {benefit.icon}
            </span>
            <span className="font-headline text-xs font-extrabold uppercase tracking-[0.13em] sm:text-sm">
              {benefit.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
