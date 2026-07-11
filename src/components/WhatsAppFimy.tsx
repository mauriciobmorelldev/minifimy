"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface WhatsAppFimyProps {
  phone?: string;
  message: string;
  messages: string[];
}

export function WhatsAppFimy({ phone, message, messages }: WhatsAppFimyProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % Math.max(messages.length, 1));
    }, 3500);
    return () => clearInterval(timer);
  }, [messages.length]);

  if (!phone) return null;

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const visibleMessages = messages.length > 0 ? messages : ["Hola, soy Fimy."];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <div className="relative max-w-[170px] rounded-full bg-surface-container-highest/90 px-4 py-2 text-xs font-semibold text-on-surface shadow-soft">
        <span className="block" aria-live="polite">
          {visibleMessages[index % visibleMessages.length]}
        </span>
        <span className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 bg-surface-container-highest" />
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group fimy-float relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-low shadow-lg shadow-on-surface/10 transition-transform duration-300 hover:-translate-y-1"
        aria-label="Abrir WhatsApp"
      >
        <Image
          src="/brand/fimy.jpg"
          alt="Fimy, la jirafita de Minifimy"
          width={64}
          height={64}
          className="h-12 w-12 rounded-full object-cover"
        />
        <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-surface-container-low opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
    </div>
  );
}
