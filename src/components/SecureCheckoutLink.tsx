import Link from "next/link";

export function SecureCheckoutLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/checkout"
      data-campaign-cta=""
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-headline font-extrabold text-on-primary shadow-soft transition-colors hover:bg-primary-dim ${className ?? ""}`}
    >
      <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
      </svg>
      Pago seguro
    </Link>
  );
}
