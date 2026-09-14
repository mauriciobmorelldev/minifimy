"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface ProductInfoModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M5.5 19.1 6.4 16A7.4 7.4 0 1 1 9 18.4l-3.5.7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 8.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4-.1.6l-.4.5c.6 1 1.4 1.7 2.5 2.3l.5-.5c.2-.2.4-.2.7-.1l1.3.6c.3.1.4.3.4.6v.5c0 .3-.1.6-.4.7-.6.3-1.5.4-2.7 0-2.7-.8-4.6-2.8-5.3-5.2-.2-.6 0-1.1.2-1.4Z" fill="currentColor" />
    </svg>
  );
}

export function ProductInfoModal({ open, title, onClose, children }: ProductInfoModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-[#2f2a22]/55 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] bg-[#fffaf1] p-5 text-on-surface shadow-lift sm:p-7">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-soft transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={`Cerrar ${title.toLowerCase()}`}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 id={titleId} className="pr-12 font-headline text-xl font-extrabold uppercase tracking-wide text-primary sm:text-2xl">{title}</h2>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}
