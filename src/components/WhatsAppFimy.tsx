"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const messages = ["Hola! Soy Fimy!", "¿Necesitas ayuda? Escribime!"];
const WHATSAPP_URL = "https://wa.me/5490000000000";

export function WhatsAppFimy() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <div className="relative max-w-[180px] rounded-lg bg-surface-container-highest px-3 py-2 text-xs font-semibold text-on-surface shadow-lg">
        <span className="block" aria-live="polite">
          {messages[index]}
        </span>
        <span className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 bg-surface-container-highest" />
      </div>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group fimy-float relative flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low shadow-xl shadow-on-surface/10 transition-transform duration-300 hover:-translate-y-1"
        aria-label="Abrir WhatsApp"
      >
        <Image
          src="/brand/fimy.jpg"
          alt="Fimy, la jirafita de Minifimy"
          width={64}
          height={64}
          className="h-14 w-14 rounded-full object-cover"
        />
        <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-surface-container-low opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
    </div>
  );
}
